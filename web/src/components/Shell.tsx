"use client";

import Link from "next/link";
import { BrandLockup } from "./Brand";
import { useWorkspace } from "@/lib/store";

export function TopNav({
  right,
}: {
  right?: React.ReactNode;
}) {
  return (
    <header className="topnav">
      <BrandLockup />
      <div className="topnav-right">
        {right}
        <SessionChip />
      </div>
    </header>
  );
}

function SessionChip() {
  const { sessionEmail } = useWorkspace();
  if (!sessionEmail) {
    return (
      <Link href="/login" className="link-quiet">
        Sign in
      </Link>
    );
  }
  return (
    <span className="session-chip">
      <span className="session-email">{sessionEmail}</span>
      <a href="/api/auth/logout" className="link-quiet">
        Sign out
      </a>
    </span>
  );
}

export function StepRail({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="step-rail" aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={label} className={`step-rail-item is-${state}`}>
            <span className="step-dot" aria-hidden />
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function AppChrome({
  children,
  step = 0,
  steps = ["Role", "Pack", "Connect", "Inbox", "Brief"],
  aside,
}: {
  children: React.ReactNode;
  step?: number;
  steps?: string[];
  aside?: React.ReactNode;
}) {
  return (
    <div className="app-chrome">
      <TopNav right={<StepRail steps={steps} current={step} />} />
      <div className={`app-body ${aside ? "has-aside" : ""}`}>
        <main className="app-main">{children}</main>
        {aside ? <aside className="app-aside">{aside}</aside> : null}
      </div>
    </div>
  );
}
