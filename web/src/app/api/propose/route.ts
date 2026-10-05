import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { proposeAllowed, recordPropose } from "@/lib/cost-breaker";
import { extractProposals } from "@/lib/extract";
import { resolvePackRuntime } from "@/lib/pack-schema";
import { getSession } from "@/lib/server/auth";
import { proposeAllowedDb, recordEvent, recordProposeDb } from "@/lib/server/db";
import { isProposeDisabled } from "@/lib/server/env";
import { clientIp, rateLimited } from "@/lib/server/rate-limit";
import { slackContextForUser } from "@/lib/server/slack";
import type { Proposal, RoleId } from "@/lib/types";

export const runtime = "nodejs";

const draftSchema = z.object({
  proposals: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        agent: z.enum(["Scribe", "Scout", "Spec", "Calendar"]),
        confidence: z.number().min(0).max(1),
        evidence: z
          .array(z.object({ quote: z.string(), sourceId: z.string().optional() }))
          .max(3)
          .optional(),
      })
    )
    .max(6),
});

const mirrorSchema = z.object({
  proposals: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        agent: z.enum(["Scribe", "Scout", "Spec", "Calendar"]),
        confidence: z.number().min(0).max(1),
        reflectionNotes: z.string(),
        evidence: z
          .array(z.object({ quote: z.string(), sourceId: z.string().optional() }))
          .max(3)
          .optional(),
        hold: z.boolean().optional(),
      })
    )
    .max(6),
});

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function localMirror(proposals: Proposal[], minConfidence: number): Proposal[] {
  return proposals.map((p) => {
    const hasCite = (p.summary?.length ?? 0) > 40;
    const confidence = Math.min(0.88, hasCite ? 0.72 : 0.48);
    const notes = hasCite
      ? "Mirror: summary has enough detail for Inbox. Check quote before write-back."
      : "Mirror: thin evidence. Edit or reject before approving writes.";
    return {
      ...p,
      confidence,
      reflectionNotes: notes,
      agent: p.agent,
      source: p.source.includes("Mirror") ? p.source : `${p.source} · Mirror`,
    };
  }).filter((p) => (p.confidence ?? 0) >= minConfidence * 0.5);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (isProposeDisabled()) {
    return NextResponse.json(
      { error: "Propose is paused (PROPOSE_DISABLED)." },
      { status: 503 }
    );
  }
  if (rateLimited(`propose:${session.id}:${clientIp(req)}`, 30)) {
    return NextResponse.json(
      { error: "Too many propose requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { notes?: string; roleId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const notes = (body.notes ?? "").trim();
  const roleId = (body.roleId ?? "ai-pm") as RoleId;
  if (!notes) {
    return NextResponse.json({ error: "Paste meeting notes first." }, { status: 400 });
  }
  if (notes.length > 8000) {
    return NextResponse.json({ error: "Keep notes under 8000 characters." }, { status: 400 });
  }

  const runtimePack = resolvePackRuntime(roleId);
  const cap = runtimePack.dailyProposalCap;
  const dbGate = await proposeAllowedDb(session.id, cap);
  const memGate = proposeAllowed(session.id, cap);
  if (!dbGate.ok || !memGate.ok) {
    return NextResponse.json(
      {
        error: `Cost circuit breaker: daily proposal cap (${cap}) reached. Try tomorrow or raise the pack cap.`,
        mode: "blocked",
      },
      { status: 429 }
    );
  }

  let slackBlock = "";
  try {
    slackBlock = await slackContextForUser(session.id);
  } catch (err) {
    console.error("slack context", err);
  }
  const promptNotes = slackBlock ? `${notes}\n\n${slackBlock}` : notes;

  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const openaiRaw = process.env.OPENAI_API_KEY?.trim();
  const openaiKey =
    openaiRaw &&
    !["your-new-key-here", "your_key", "your-key-here"].includes(openaiRaw)
      ? openaiRaw
      : undefined;
  const ollamaBase = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2";

  const system = `You are Stack Spoon's Pack Crew (Scribe/Scout/Spec/Calendar).
Extract Inbox proposals from meeting notes for role ${roleId}.
Rules:
- Only propose decisions, actions, risks, or ticket drafts grounded in the notes.
- Include a short evidence quote from the notes when possible.
- No em dashes. Concise titles.
- Prefer Scribe for decisions/actions, Scout for risks, Spec for ticket/PRD drafts, Calendar for focus conflicts.
- Max 5 proposals.`;

  async function draftWith(
    kind: "gemini" | "ollama" | "openai"
  ): Promise<z.infer<typeof draftSchema>> {
    if (kind === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey: googleKey! });
      const result = await generateObject({
        model: google("gemini-3.1-flash-lite"),
        schema: draftSchema,
        system,
        prompt: promptNotes,
        temperature: 0.2,
      });
      return result.object;
    }
    if (kind === "ollama") {
      const ollama = createOpenAI({ baseURL: ollamaBase, apiKey: "ollama" });
      const result = await generateObject({
        model: ollama(ollamaModel),
        schema: draftSchema,
        system,
        prompt: promptNotes,
        temperature: 0.2,
      });
      return result.object;
    }
    const openai = createOpenAI({ apiKey: openaiKey! });
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: draftSchema,
      system,
      prompt: notes,
      temperature: 0.2,
    });
    return result.object;
  }

  async function mirrorWith(
    kind: "gemini" | "ollama" | "openai",
    drafts: z.infer<typeof draftSchema>["proposals"]
  ): Promise<z.infer<typeof mirrorSchema>> {
    const mirrorSystem = `You are Mirror, Stack Spoon's reflection agent.
Critique and revise Pack Crew proposals before they hit the HITL Inbox.
Checks: evidence cite, role policy, cost/risk, duplicates.
Return revised proposals with reflectionNotes (1-2 sentences, no em dashes).
Lower confidence when evidence is weak. Set hold=true only for dangerous silent writes.`;

    const prompt = `Role: ${roleId}
Notes:\n${promptNotes}\n\nDrafts JSON:\n${JSON.stringify(drafts)}`;

    if (kind === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey: googleKey! });
      const result = await generateObject({
        model: google("gemini-3.1-flash-lite"),
        schema: mirrorSchema,
        system: mirrorSystem,
        prompt,
        temperature: 0.1,
      });
      return result.object;
    }
    if (kind === "ollama") {
      const ollama = createOpenAI({ baseURL: ollamaBase, apiKey: "ollama" });
      const result = await generateObject({
        model: ollama(ollamaModel),
        schema: mirrorSchema,
        system: mirrorSystem,
        prompt,
        temperature: 0.1,
      });
      return result.object;
    }
    const openai = createOpenAI({ apiKey: openaiKey! });
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: mirrorSchema,
      system: mirrorSystem,
      prompt,
      temperature: 0.1,
    });
    return result.object;
  }

  const attempts: Array<"gemini" | "ollama" | "openai"> = [];
  if (googleKey) attempts.push("gemini");
  attempts.push("ollama");
  if (openaiKey) attempts.push("openai");

  const now = new Date().toISOString();
  let mode = "quick";
  let model = "keyword";
  let proposals: Proposal[] = [];

  for (const kind of attempts) {
    try {
      const draft = await draftWith(kind);
      let mirrored = draft.proposals.map((p) => ({
        ...p,
        reflectionNotes: "Mirror skipped",
      }));

      if (runtimePack.mirrorPolicy.enabled) {
        try {
          const m = await mirrorWith(kind, draft.proposals);
          mirrored = m.proposals.filter((p) => !p.hold);
        } catch (err) {
          console.error("propose mirror error", err);
          mirrored = draft.proposals.map((p) => ({
            ...p,
            reflectionNotes:
              "Mirror local fallback: revise for evidence before approve.",
          }));
        }
      }

      proposals = mirrored.map((p) => ({
        id: uid("prop"),
        title: p.title,
        summary: p.summary,
        source: `Meeting notes · ${p.agent} · Mirror`,
        agent: p.agent,
        status: "pending" as const,
        createdAt: now,
        confidence: Math.min(0.92, Math.max(0.35, p.confidence)),
        reflectionNotes: p.reflectionNotes,
        evidence: p.evidence,
      }));

      if (proposals.length === 0) continue;

      mode = kind === "gemini" ? "gemini" : kind === "ollama" ? "ollama" : "smart";
      model =
        kind === "gemini"
          ? "gemini-3.1-flash-lite"
          : kind === "ollama"
            ? ollamaModel
            : "gpt-4o-mini";
      break;
    } catch (err) {
      console.error(`propose ${kind} error`, err);
    }
  }

  if (proposals.length === 0) {
    proposals = localMirror(
      extractProposals(notes, roleId),
      runtimePack.mirrorPolicy.minConfidence
    );
    mode = "quick";
    model = "keyword+mirror";
  }

  // AI-PM: optional Drift stub proposal when addon present
  if (
    roleId === "ai-pm" &&
    runtimePack.addons.includes("drift") &&
    proposals.length > 0
  ) {
    proposals.push({
      id: uid("drift"),
      title: "Schedule Drift check (T+30)",
      summary:
        "After ship, compare predicted eval/metric impact against actuals and route a course-correction brief to Inbox.",
      source: "Pack Crew · Drift",
      agent: "Drift",
      status: "pending",
      createdAt: now,
      confidence: 0.7,
      reflectionNotes: "Mirror: Drift is a calendar commitment, not a write yet.",
    });
  }

  recordPropose(session.id, proposals.length);
  await recordProposeDb(session.id, proposals.length);
  await recordEvent(session.id, "propose", String(proposals.length));

  return NextResponse.json({
    proposals,
    mode,
    model,
    crew: runtimePack.crew.map((c) => c.id),
    addons: runtimePack.addons,
    mirrorPolicy: runtimePack.mirrorPolicy,
  });
}
