import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/Brand";

export default function LandingPage() {
  return (
    <div className="landing maison">
      <div className="landing-stage" aria-hidden>
        <video
          className="landing-stage-video"
          src="/brand/explainer.mp4?v=6"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="landing-stage-veil" />
      </div>

      <nav className="landing-nav">
        <BrandLockup />
      </nav>

      <section className="landing-hero">
        <div className="hero-inner">
          <div className="hero-brand">
            <Image
              src="/brand/mark.svg"
              alt="Stack Spoon"
              width={72}
              height={72}
              priority
              className="brand-mark hero-mark"
            />
            <h1 className="brand-word">Stack Spoon</h1>
          </div>

          <p className="hero-line">
            Pick your role. Approve what agents propose. Soft Launch reads Slack
            and writes Linear only after you say so. Other apps stay Preview.
          </p>

          <div className="hero-cta">
            <Link href="/start" className="btn btn-primary">
              Start with your role
            </Link>
            <Link href="/contact" className="hero-contact-link">
              Contact
            </Link>
          </div>
        </div>
      </section>
      <footer className="landing-legal">
        <Link href="/invite">Design partners</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
