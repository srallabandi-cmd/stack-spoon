import Link from "next/link";
import { BrandLockup } from "@/components/Brand";

export default function TermsPage() {
  return (
    <div className="contact-page">
      <nav className="landing-nav contact-nav">
        <BrandLockup />
        <Link href="/" className="link-quiet">
          Back to home
        </Link>
      </nav>
      <main className="contact-main">
        <div className="panel contact-panel">
          <p className="eyebrow">Legal</p>
          <h1>Terms</h1>
          <p className="lede">
            Soft Launch is an invite preview. The product may change. Do not use
            it as the system of record for production work until Hard Launch.
          </p>
          <ul className="kit-list">
            <li>You must have the right to connect Slack and Linear workspaces you authorize.</li>
            <li>Agents propose. You approve. Writes to Linear happen only after Approve or Edit.</li>
            <li>Calendar, Granola, Notion, HubSpot, and GitHub tiles may be demo or Preview.</li>
            <li>We may pause propose or write-back with a kill switch if cost or safety requires it.</li>
            <li>The service is provided as-is during invite. No SLA yet.</li>
          </ul>
          <p className="lede">Last updated: 16 August 2026.</p>
        </div>
      </main>
    </div>
  );
}
