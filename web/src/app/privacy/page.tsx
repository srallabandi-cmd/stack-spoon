import Link from "next/link";
import { BrandLockup } from "@/components/Brand";

export default function PrivacyPage() {
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
          <h1>Privacy</h1>
          <p className="lede">
            Stack Spoon is in Soft Launch. We collect the minimum needed to run
            the invite product.
          </p>
          <ul className="kit-list">
            <li>Account email, for magic-link sign-in.</li>
            <li>Workspace data you create: role pack, notes, Inbox decisions, Lake entries.</li>
            <li>
              Connector tokens if you connect Slack or Linear. Tokens are encrypted
              at rest. We read Slack only to draft proposals. We write Linear only
              after you Approve.
            </li>
            <li>Contact form fields, including optional design-partner interest.</li>
          </ul>
          <p className="lede">
            We do not sell data. We do not train public models on your workspace.
            You can ask us to delete your account by emailing the contact form.
          </p>
          <p className="lede">Last updated: 16 August 2026.</p>
        </div>
      </main>
    </div>
  );
}
