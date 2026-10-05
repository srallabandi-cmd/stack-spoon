"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { PACK_STEPS, ROLES, pressureLabel } from "@/lib/data";
import { addonLabel, resolvePackRuntime } from "@/lib/pack-schema";
import { getRolePack } from "@/lib/role-packs";
import { useWorkspace } from "@/lib/store";

type PackTab = "picks" | "crew" | "costs" | "why";

export default function PackPage() {
  const { roleId, installPack, packInstalled, enabledAddons, toggleAddon } =
    useWorkspace();
  const router = useRouter();
  const [visible, setVisible] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [tab, setTab] = useState<PackTab>("picks");

  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];
  const pack = useMemo(() => getRolePack(roleId), [roleId]);
  const runtime = useMemo(() => resolvePackRuntime(roleId), [roleId]);
  const isEarly = pack.roleId === "early-stage";
  const isPreview = role.status === "preview";
  const isAiPm = pack.roleId === "ai-pm";

  useEffect(() => {
    if (!roleId) router.replace("/start");
  }, [roleId, router]);

  async function runInstall() {
    setInstalling(true);
    for (let i = 0; i < PACK_STEPS.length; i++) {
      setVisible(i + 1);
      await new Promise((r) => setTimeout(r, 550));
    }
    installPack();
    setInstalling(false);
  }

  return (
    <AppChrome step={1}>
      <div className="panel">
        <p className="eyebrow">Step 2 · Role Pack</p>
        <div className="pack-title-row">
          <h1>Install the {role.title} pack</h1>
          <span className={`pressure-badge is-${pack.pressure}`}>
            {pressureLabel(pack.pressure)}
          </span>
        </div>
        <p className="lede">
          Skills, product picks, connector presets, and approve-before-send
          defaults for how you actually work.
        </p>
        {isPreview && (
          <div className="demo-banner">
            Preview kit. Same guided path with sample data. Live connects come next.
          </div>
        )}
        <SpoonTip>
          Skim the picks, then install. You can always reopen costs and benchmarks
          after.
        </SpoonTip>

        <section className="kit-summary">
          <h2>What this kit attacks</h2>
          <ul className="kit-list kit-list-compact">
            {pack.painPoints.slice(0, 3).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <div className="pack-tabs" role="tablist" aria-label="Pack details">
          {(
            [
              ["picks", "Picks"],
              ["crew", "Crew"],
              ["costs", "Costs"],
              ["why", "Why us"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`pack-tab ${tab === id ? "is-on" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "picks" && (
          <section className="kit-section">
            <h2>Stack Spoon picks</h2>
            <p className="kit-sub">Editorial recommendations for this role.</p>
            <div className="product-grid">
              {pack.recommendedProducts.map((prod) => (
                <div key={`${prod.job}-${prod.product}`} className="product-tile">
                  <div className="product-tile-top">
                    <h3>{prod.product}</h3>
                    <span className={`tier-chip is-${prod.tier}`}>{prod.tier}</span>
                  </div>
                  <p className="product-job">{prod.job}</p>
                  <p>{prod.why}</p>
                </div>
              ))}
            </div>
            <h3 className="kit-subhead">Agents in this pack</h3>
            <div className="agent-card-grid">
              {pack.agents.map((a) => (
                <div key={a.name} className="agent-card">
                  <strong>{a.name}</strong>
                  <p>{a.job}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "crew" && (
          <section className="kit-section">
            <h2>Pack Crew</h2>
            <p className="kit-sub">
              Curated seats, not a DIY agent canvas. Mirror reflects before Inbox.
            </p>
            <div className="agent-card-grid">
              {runtime.crew.map((seat) => (
                <div key={seat.id} className="agent-card">
                  <strong>{seat.id}</strong>
                  <p>{seat.job}</p>
                  {seat.tools.length ? (
                    <p className="product-job">Tools: {seat.tools.join(", ")}</p>
                  ) : (
                    <p className="product-job">Meta · no external writes</p>
                  )}
                </div>
              ))}
            </div>
            <h3 className="kit-subhead">Addons</h3>
            <ul className="kit-list">
              {runtime.addons.map((id) => (
                <li key={id}>
                  <label className="addon-toggle">
                    <input
                      type="checkbox"
                      checked={enabledAddons.includes(id)}
                      onChange={() => toggleAddon(id)}
                    />
                    {addonLabel(id)}
                  </label>
                </li>
              ))}
            </ul>
            {isAiPm ? (
              <div className="demo-banner" style={{ marginTop: "1rem" }}>
                Eval Craft Kit: treat launch gates and offline/online evals as
                first-class pack artifacts before autonomy rises.
              </div>
            ) : null}
            <p className="kit-sub">
              Mirror policy · max {runtime.mirrorPolicy.maxLoops} loops · min
              confidence {runtime.mirrorPolicy.minConfidence} · daily cap{" "}
              {runtime.dailyProposalCap}
            </p>
          </section>
        )}

        {tab === "costs" && (
          <section className="kit-section">
            <h2>Cost guardrails</h2>
            <ul className="kit-list">
              {pack.costGuardrails.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            {isEarly && pack.costBands && (
              <div className="early-bands">
                <h3 className="kit-subhead">Monthly cost bands</h3>
                <p className="kit-sub">{pack.earlyStageNote}</p>
                <div className="band-grid">
                  {pack.costBands.map((b) => (
                    <div key={b.band} className="band-tile">
                      <h3>{b.band}/mo</h3>
                      <p>{b.stack}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "why" && (
          <section className="kit-section">
            <h2>Gaps we fill vs the best teams</h2>
            <div className="benchmark-grid">
              {pack.companyBenchmarks.map((b) => (
                <div key={b.firm} className="benchmark-tile">
                  <h3>{b.firm}</h3>
                  <p>
                    <strong>They do:</strong> {b.whatTheyDo}
                  </p>
                  <p>
                    <strong>We fill:</strong> {b.gapWeFill}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pack-steps">
          {PACK_STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`pack-step ${visible > i || packInstalled ? "is-on" : ""}`}
            >
              <div className="pack-index">{i + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="actions-row">
          {!packInstalled ? (
            <button
              type="button"
              className="btn btn-brass"
              disabled={installing}
              onClick={runInstall}
            >
              {installing ? "Installing demo pack…" : "Install demo pack"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push("/hub")}
            >
              Open Connector Hub
            </button>
          )}
        </div>
      </div>
    </AppChrome>
  );
}
