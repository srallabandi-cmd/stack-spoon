import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES } from "@/lib/data";
import { getRolePack, ROLE_PACKS, scoreRolePacks } from "@/lib/role-packs";
import { getSession } from "@/lib/server/auth";
import { clientIp, rateLimited } from "@/lib/server/rate-limit";
import type { RoleId } from "@/lib/types";

export const runtime = "nodejs";

const diagnoseSchema = z.object({
  roleId: z.string(),
  confidence: z.number().min(0).max(1),
  why: z.string(),
  products: z.array(z.string()).max(6),
  nextStep: z.string(),
  alternates: z
    .array(
      z.object({
        roleId: z.string(),
        why: z.string(),
      })
    )
    .max(3)
    .optional(),
});

type DiagnoseResult = z.infer<typeof diagnoseSchema>;
type Alternate = NonNullable<DiagnoseResult["alternates"]>[number];

/** Adjacent packs when same-group is empty (e.g. Startup singleton). */
const ADJACENT: Partial<Record<RoleId, RoleId[]>> = {
  "early-stage": ["ai-pm", "pm", "admin"],
  "it-security": ["legal-compliance", "admin"],
  "ai-pm": ["pm", "software-engineer", "early-stage"],
  pm: ["ai-pm", "program", "early-stage"],
  design: ["pm", "ai-pm"],
  "legal-compliance": ["it-security", "finance", "admin"],
  admin: ["early-stage", "people-ops", "finance"],
  "software-engineer": ["ai-pm", "data-analyst"],
  consultant: ["pm", "ai-pm", "early-stage"],
};

function validRoleId(id: string): id is RoleId {
  return ROLES.some((r) => r.id === id);
}

function roleTitle(id: RoleId): string {
  return ROLES.find((r) => r.id === id)?.title ?? id;
}

function q(query: string): string {
  return query.toLowerCase();
}

function hasAiProductSignals(query: string): boolean {
  return /ai\s*pm|ai product|evals?|agent launch|llm|copilot|cursor|model routing/.test(
    q(query)
  );
}

function hasFractionalOperatorSignals(query: string): boolean {
  const t = q(query);
  const fractional =
    /fractional|interim|consulting|consultant|advisor|advising|i advise/.test(t);
  const productTitle =
    /\bcpo\b|\bcpto\b|\bpm\b|product manager|product lead|head of product|vp product/.test(
      t
    );
  return fractional && productTitle;
}

function hasFounderSignals(query: string): boolean {
  const t = q(query);
  return (
    /\bfounder\b|\bco-founder\b|our startup|we're a (seed|early)|we are a (seed|early)|1-10|under 10|headcount.*(under|less|<)\s*10|tiny startup|bootstrapp/.test(
      t
    ) && !hasFractionalOperatorSignals(query)
  );
}

function hasEmployedPmSignals(query: string): boolean {
  const t = q(query);
  return (
    /at a (series|company|startup)|series [abc]|employed|i'?m (an? )?(ai )?product manager|i work as/.test(
      t
    ) && !hasFounderSignals(query)
  );
}

function hasDesignSignals(query: string): boolean {
  return /design|ux|ui|figma|critique/.test(q(query));
}

function productPackForQuery(query: string): RoleId {
  return hasAiProductSignals(query) ? "ai-pm" : "pm";
}

function alternateWhy(roleId: RoleId): string {
  return getRolePack(roleId).painPoints[0] ?? "Related kit";
}

function applyRoleGuards(
  query: string,
  result: DiagnoseResult & { roleId: RoleId }
): {
  roleId: RoleId;
  why: string;
  overridden: boolean;
  displaced: RoleId | null;
  conflict: boolean;
} {
  let roleId = result.roleId;
  let why = result.why;
  let overridden = false;
  let displaced: RoleId | null = null;
  let conflict = false;

  const fractionalOp = hasFractionalOperatorSignals(query);
  const employedPm = hasEmployedPmSignals(query);
  const founder = hasFounderSignals(query);
  const targetProduct = productPackForQuery(query);

  // Fractional / consulting CPO-PM advising seed cos → product pack, not early-stage kit
  if (fractionalOp && roleId === "early-stage") {
    displaced = "early-stage";
    roleId = targetProduct;
    overridden = true;
    conflict = true;
    why = `${why} Routed to the product pack because fractional or operator language beats the seed-company kit.`;
  }

  // Employed Series A+ / at-a-company PM without founder → not early-stage
  if (!fractionalOp && employedPm && roleId === "early-stage") {
    displaced = "early-stage";
    roleId = targetProduct;
    overridden = true;
    conflict = true;
    why = `${why} Routed to the product pack because employed PM language beats the early-stage founder kit.`;
  }

  // Strong founder + tiny company, model picked plain pm with no product craft → early-stage
  if (
    founder &&
    roleId === "pm" &&
    !hasAiProductSignals(query) &&
    !/product manager|cpo|cpto|roadmap|prd|evals/.test(q(query))
  ) {
    displaced = "pm";
    roleId = "early-stage";
    overridden = true;
    conflict = true;
    why = `${why} Routed to Early Stage because founder and tiny-team signals dominate.`;
  }

  if (fractionalOp && (roleId === "ai-pm" || roleId === "pm")) {
    conflict = true;
    // Keep early-stage visible under Also consider even when model already picked product.
    if (!displaced) displaced = "early-stage";
  }

  return { roleId, why, overridden, displaced, conflict };
}

function softenConfidence(opts: {
  raw: number;
  overridden: boolean;
  conflict: boolean;
  query: string;
  roleId: RoleId;
}): number {
  let confidence = Math.min(0.92, Math.max(0.45, opts.raw));

  if (opts.overridden) {
    confidence = Math.min(confidence, 0.72);
  } else if (opts.conflict) {
    confidence = Math.min(confidence, 0.75);
  }

  // Slam dunk: security title + pains, no conflict
  const securitySlam =
    opts.roleId === "it-security" &&
    /security|incident|access review/.test(q(opts.query)) &&
    !opts.conflict &&
    !opts.overridden;
  if (securitySlam) {
    confidence = Math.min(0.92, Math.max(confidence, 0.85));
  }

  // Keyword score proximity → soft confidence
  const ranked = scoreRolePacks(opts.query);
  const top = ranked.find((r) => r.pack.roleId === opts.roleId);
  const runner = ranked.find((r) => r.pack.roleId !== opts.roleId);
  if (top && runner && top.score > 0 && runner.score >= top.score * 0.8) {
    confidence = Math.min(confidence, 0.75);
  }

  return confidence;
}

function resolveAlternates(
  topId: RoleId,
  modelAlts: Alternate[] | undefined,
  query: string,
  displaced: RoleId | null
): Alternate[] {
  const ranked = scoreRolePacks(query);
  const topGroup = ROLES.find((r) => r.id === topId)?.group;
  const out: Alternate[] = [];
  const seen = new Set<RoleId>([topId]);

  function push(roleId: RoleId, why?: string) {
    if (seen.has(roleId) || !validRoleId(roleId)) return;
    // Drop Design under Early Stage unless design keywords present
    if (
      roleId === "design" &&
      topId === "early-stage" &&
      !hasDesignSignals(query)
    ) {
      return;
    }
    seen.add(roleId);
    out.push({ roleId, why: why ?? alternateWhy(roleId) });
  }

  if (displaced) {
    push(displaced, alternateWhy(displaced));
  }

  const modelValid = (modelAlts ?? []).filter(
    (a) => validRoleId(a.roleId) && a.roleId !== topId
  ) as Array<{ roleId: RoleId; why: string }>;

  const adjacent = ADJACENT[topId] ?? [];
  const adjRank = (id: RoleId) => {
    const i = adjacent.indexOf(id);
    return i === -1 ? 100 : i;
  };

  // Adjacency-preferred same-group (e.g. legal-compliance before admin for security)
  const sameGroupModel = modelValid
    .filter((a) => ROLES.find((r) => r.id === a.roleId)?.group === topGroup)
    .sort((a, b) => adjRank(a.roleId) - adjRank(b.roleId));

  // Seed with adjacency list so preferred neighbors win order
  for (const id of adjacent) {
    if (out.length >= 2) break;
    const fromModel = modelValid.find((a) => a.roleId === id);
    push(id, fromModel?.why);
  }

  for (const a of sameGroupModel) {
    if (out.length >= 2) break;
    push(a.roleId, a.why);
  }

  // Then other model alts
  for (const a of modelValid) {
    if (out.length >= 2) break;
    push(a.roleId, a.why);
  }

  // Keyword fill (prefer same group, then score)
  const same = ranked.filter(
    (r) =>
      r.pack.roleId !== topId &&
      ROLES.find((x) => x.id === r.pack.roleId)?.group === topGroup
  );
  for (const r of same) {
    if (out.length >= 2) break;
    push(r.pack.roleId);
  }
  for (const r of ranked) {
    if (out.length >= 2) break;
    push(r.pack.roleId);
  }

  return out.slice(0, 2);
}

function finalizeDiagnose(
  query: string,
  object: DiagnoseResult & { roleId: RoleId }
): DiagnoseResult {
  const guard = applyRoleGuards(query, object);
  const pack = getRolePack(guard.roleId);
  const products =
    object.roleId === guard.roleId
      ? object.products
      : pack.recommendedProducts.slice(0, 4).map((p) => p.product);

  const confidence = softenConfidence({
    raw: object.confidence,
    overridden: guard.overridden,
    conflict: guard.conflict,
    query,
    roleId: guard.roleId,
  });

  const alternates = resolveAlternates(
    guard.roleId,
    object.alternates,
    query,
    guard.displaced
  );

  let nextStep = object.nextStep;
  if (guard.overridden && guard.roleId !== object.roleId) {
    nextStep =
      pack.roleId === "early-stage"
        ? "Install the Early Stage pack, connect Slack and Calendar, and keep daily caps tight."
        : "Install this Role Pack, then connect Slack and Calendar in the Hub.";
  }

  return {
    roleId: guard.roleId,
    confidence,
    why: guard.why.replace(/\s+/g, " ").trim(),
    products: products.slice(0, 6),
    nextStep,
    alternates,
  };
}

function keywordFallback(query: string): DiagnoseResult {
  const ranked = scoreRolePacks(query);
  let top = ranked[0]?.pack ?? ROLE_PACKS.find((p) => p.roleId === "ai-pm")!;

  // Apply same guards on quick path
  const draft: DiagnoseResult & { roleId: RoleId } = {
    roleId: top.roleId,
    confidence: ranked[0] ? Math.min(0.58, 0.28 + ranked[0].score / 80) : 0.28,
    why:
      ranked[0]?.score > 0
        ? `Quick match to ${roleTitle(top.roleId)} from how you described the work.`
        : "Defaulted to AI Product Manager. Add more detail about your job for a sharper match.",
    products: top.recommendedProducts.slice(0, 4).map((p) => p.product),
    nextStep: "Install this Role Pack, then connect Slack and Calendar in the Hub.",
    alternates: [],
  };

  return finalizeDiagnose(query, draft);
}

function packContext(query: string) {
  const ranked = scoreRolePacks(query);
  const top = (ranked.length ? ranked : ROLE_PACKS.map((pack) => ({ pack, score: 0 })))
    .slice(0, 6)
    .map(({ pack, score }) => ({
      roleId: pack.roleId,
      score,
      pressure: pack.pressure,
      painPoints: pack.painPoints,
      products: pack.recommendedProducts.map((p) => `${p.product} (${p.job})`),
      costGuardrails: pack.costGuardrails.slice(0, 3),
      agents: pack.agents.map((a) => a.name),
    }));
  return top;
}

export async function POST(req: Request) {
  const session = await getSession();
  const limitKey = session?.id ?? clientIp(req);
  if (rateLimited(`diagnose:${limitKey}`, 20)) {
    return NextResponse.json(
      { error: "Too many diagnose requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  if (query.length < 8) {
    return NextResponse.json(
      { error: "Describe your role in a short sentence (at least a few words)." },
      { status: 400 }
    );
  }
  if (query.length > 1200) {
    return NextResponse.json({ error: "Keep the description under 1200 characters." }, { status: 400 });
  }

  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const openaiKeyRaw = process.env.OPENAI_API_KEY?.trim();
  const openaiKey =
    openaiKeyRaw &&
    !["your-new-key-here", "your_key", "your-key-here"].includes(openaiKeyRaw)
      ? openaiKeyRaw
      : undefined;
  const ollamaBase =
    process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2";

  const catalog = packContext(query);
  const catalogJson = JSON.stringify(catalog);

  const system = `You are Stack Spoon's role diagnostician.
Pick the single best Role Pack from the provided catalog for the user's job description.
Only use roleId values that appear in the catalog. Never invent roles.

Job title ontology:
- product manager / CPO / CPTO → pm or ai-pm (prefer ai-pm when they mention AI product, evals, agents, or LLM launches).
- fractional, interim, consulting, or advising CPO/PM → pm or ai-pm. Never early-stage for operators who advise startups.
- engineer → software-engineer when coding, Copilot, Cursor, or token spend dominate.
- founder / co-founder / "our 1-10 person startup" / "we're a seed company" → early-stage.
- early-stage ONLY if they ARE the founding team or company size is tiny. Not if they advise or work fractional for seed startups.
- IT/security, access reviews, incidents → it-security. Prefer legal-compliance as an alternate over admin or finance.
- design/UX/Figma critique → design.

Alternates: prefer same role group. If the group is a singleton (Startup), pick adjacent packs (ai-pm, pm, admin for early-stage), never unrelated roles.

Return concise why text (2 sentences max). No em dashes.
products must be short product names from the matched pack (e.g. Granola), not "Product (job)" strings.
Be honest on confidence: ambiguous identity (fractional vs founder) should be under 0.8.`;

  const prompt = `User description:
${query}

Ranked Role Pack catalog (JSON):
${catalogJson}

Recommend the best pack.`;

  async function runModel(
    kind: "ollama" | "gemini" | "openai"
  ): Promise<DiagnoseResult> {
    if (kind === "ollama") {
      const ollama = createOpenAI({
        baseURL: ollamaBase,
        apiKey: "ollama",
      });
      const result = await generateObject({
        model: ollama(ollamaModel),
        schema: diagnoseSchema,
        system,
        prompt,
        temperature: 0.2,
      });
      return result.object;
    }
    if (kind === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey: googleKey! });
      const result = await generateObject({
        model: google("gemini-3.1-flash-lite"),
        schema: diagnoseSchema,
        system,
        prompt,
        temperature: 0.2,
      });
      return result.object;
    }
    const openai = createOpenAI({ apiKey: openaiKey! });
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: diagnoseSchema,
      system,
      prompt,
      temperature: 0.2,
    });
    return result.object;
  }

  // Prefer Gemini when a Google key is present, then Ollama, then OpenAI.
  const attempts: Array<"gemini" | "ollama" | "openai"> = [];
  if (googleKey) attempts.push("gemini");
  attempts.push("ollama");
  if (openaiKey) attempts.push("openai");

  let lastErr: unknown;
  for (const kind of attempts) {
    try {
      const object = await runModel(kind);

      if (!validRoleId(object.roleId)) {
        continue;
      }

      const finalized = finalizeDiagnose(query, {
        ...object,
        roleId: object.roleId,
      });

      const mode =
        kind === "gemini" ? "gemini" : kind === "ollama" ? "ollama" : "smart";
      const model =
        kind === "gemini"
          ? "gemini-3.1-flash-lite"
          : kind === "ollama"
            ? ollamaModel
            : "gpt-4o-mini";

      return NextResponse.json({
        ...finalized,
        mode,
        model,
      });
    } catch (err) {
      lastErr = err;
      console.error(`diagnose ${kind} error`, err);
    }
  }

  console.error("diagnose all providers failed", lastErr);
  return NextResponse.json({
    ...keywordFallback(query),
    mode: "quick" as const,
  });
}
