"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { ROLE_GROUPS, ROLES, pressureLabel } from "@/lib/data";
import { useWorkspace } from "@/lib/store";
import type { RoleId } from "@/lib/types";

type DiagnoseMatch = {
  roleId: RoleId;
  confidence: number;
  why: string;
  products: string[];
  nextStep: string;
  mode?: string;
  model?: string;
  alternates?: { roleId: string; why: string }[];
};

export default function StartPage() {
  const { roleId, selectRole } = useWorkspace();
  const [selected, setSelected] = useState<RoleId | null>(roleId);
  const [query, setQuery] = useState("");
  const [diagnosing, setDiagnosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<DiagnoseMatch | null>(null);
  const router = useRouter();

  const grouped = useMemo(
    () =>
      ROLE_GROUPS.map((group) => ({
        group,
        roles: ROLES.filter((r) => r.group === group),
      })).filter((g) => g.roles.length > 0),
    []
  );

  function continueFlow(id: RoleId) {
    selectRole(id);
    setSelected(id);
    router.push("/pack");
  }

  async function runDiagnose(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setMatch(null);
    setDiagnosing(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Diagnose failed");
        return;
      }
      setMatch(data as DiagnoseMatch);
      if (data.roleId) {
        setSelected(data.roleId as RoleId);
        selectRole(data.roleId as RoleId);
      }
    } catch {
      setError("Could not reach diagnose. Try picking a role below.");
    } finally {
      setDiagnosing(false);
    }
  }

  const matchedRole = match
    ? ROLES.find((r) => r.id === match.roleId)
    : null;

  return (
    <AppChrome step={0}>
      <div className="panel">
        <p className="eyebrow">Step 1 · Fitting</p>
        <h1>Describe your work</h1>
        <p className="lede">
          One short description is enough. We recommend a Role Pack built for how
          you actually work, not a blank agent canvas.
        </p>

        <form className="diagnose-bar diagnose-bar-hero" onSubmit={runDiagnose}>
          <label htmlFor="diagnose-input" className="diagnose-label">
            Private fitting
          </label>
          <div className="diagnose-row">
            <input
              id="diagnose-input"
              className="diagnose-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "Series A founder drowning in meetings and Slack"'
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-brass"
              disabled={diagnosing || query.trim().length < 8}
            >
              {diagnosing ? "Diagnosing…" : "Diagnose"}
            </button>
          </div>
          {error && <p className="diagnose-error">{error}</p>}
        </form>

        {match && matchedRole && (
          <div className="diagnose-result">
            <div className="diagnose-result-head">
              <div>
                <p className="eyebrow">Best match</p>
                <h2>{matchedRole.title}</h2>
                <p className="lede" style={{ marginBottom: 0 }}>
                  {match.why}
                </p>
              </div>
              <span className="badge">
                {Math.round(match.confidence * 100)}% confidence
              </span>
            </div>
            {match.products?.length > 0 && (
              <div className="pill-row">
                {match.products.map((p) => (
                  <span key={p} className="pill">
                    {p}
                  </span>
                ))}
              </div>
            )}
            <p className="diagnose-next">{match.nextStep}</p>
            {match.mode === "quick" && (
              <p className="diagnose-mode">Quick match from your description.</p>
            )}
            {(match.mode === "ollama" ||
              match.mode === "smart" ||
              match.mode === "gemini") && (
              <p className="diagnose-mode">
                Neural match
                {match.model ? ` · ${match.model}` : ""}
              </p>
            )}
            <div className="actions-row" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => continueFlow(match.roleId)}
              >
                Install this Role Pack
              </button>
            </div>
            {match.alternates && match.alternates.length > 0 && (
              <div className="alt-matches">
                <p className="eyebrow">Also consider</p>
                {match.alternates.map((alt) => {
                  const role = ROLES.find((r) => r.id === alt.roleId);
                  if (!role) return null;
                  return (
                    <button
                      key={alt.roleId}
                      type="button"
                      className="alt-match"
                      onClick={() => continueFlow(alt.roleId as RoleId)}
                    >
                      <strong>{role.title}</strong>
                      <span>{alt.why}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <SpoonTip>
          Prefer browsing? Choose a role below. Live packs are fully guided.
          Preview kits use sample data for the same path.
        </SpoonTip>

        <p className="role-browse-label">Or browse the atelier</p>

        {grouped.map(({ group, roles }) => (
          <section key={group} className="role-group">
            <h2 className="role-group-title">{group}</h2>
            <div className="role-grid">
              {roles.map((role) => {
                const live = role.status === "live";
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-card ${selected === role.id ? "is-selected" : ""} ${
                      live ? "" : "is-preview"
                    }`}
                    onClick={() => continueFlow(role.id)}
                  >
                    <div className="role-card-top">
                      <h3>{role.title}</h3>
                      <span
                        className={`pressure-badge is-${role.pressure}`}
                      >
                        {pressureLabel(role.pressure)}
                      </span>
                    </div>
                    <p>{role.blurb}</p>
                    <span className={`badge ${live ? "" : "badge-muted"}`}>
                      {live ? "Live pack" : "Preview kit"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <p className="refuge-link-row">
          <a href="/refuge" className="link-quiet">
            Coming from Relay?
          </a>
        </p>
      </div>
    </AppChrome>
  );
}
