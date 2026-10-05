import Link from "next/link";
import { BrandLockup } from "@/components/Brand";

export default function InvitePage() {
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
          <p className="eyebrow">Design partners</p>
          <h1>Soft Launch invite</h1>
          <p className="lede">
            We are looking for 5 to 15 AI PMs or operators who live in Slack and
            Linear. You install the AI-PM pack, connect those two apps, Approve
            in Inbox, and tell us if a real Linear issue appeared.
          </p>
          <ul className="kit-list">
            <li>Beachhead pack: AI Product Manager. Early Stage is the backup path.</li>
            <li>Weekly pivot: is Linear the right write SoR? Is the pack right?</li>
            <li>Preview connectors stay labeled. No MCP setup.</li>
          </ul>
          <div className="actions-row">
            <Link href="/contact" className="btn btn-primary">
              Request an invite
            </Link>
            <Link href="/login" className="btn btn-ghost">
              I already have access
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
