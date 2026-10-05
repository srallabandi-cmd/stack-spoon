"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { BrandLockup } from "@/components/Brand";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/start";
  const expired = params.get("error") === "expired";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(expired ? "That link expired. Request a new one." : null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const data = await res.json();
      if (data.devLink) {
        setDevLink(data.devLink);
      }
      if (!res.ok) {
        setError(data.error ?? "Could not save your invite.");
        return;
      }
      setEmailed(Boolean(data.emailed));
      setSent(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="eyebrow">Invite</p>
          <h1>Enter your email</h1>
          <p className="lede">
            Anyone who enters an email is added to Soft Launch. We send a one-time
            sign-in link. No password.
          </p>
          {sent ? (
            <div className="contact-success">
              {emailed ? (
                <>
                  <h2>Check your inbox</h2>
                  <p>
                    You are on the invite list. The sign-in link expires in 15 minutes.
                  </p>
                </>
              ) : (
                <>
                  <h2>You are on the invite list</h2>
                  <p>
                    We saved your email. A sign-in link will follow as soon as
                    outbound mail can reach any address, not just the account owner.
                  </p>
                </>
              )}
              {devLink ? (
                <p className="lede">
                  Local bypass:{" "}
                  <a href={devLink} className="hero-contact-link" style={{ color: "inherit" }}>
                    Open sign-in link
                  </a>
                </p>
              ) : null}
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <label className="contact-field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {error ? <p className="diagnose-error">{error}</p> : null}
              <div className="actions-row">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : "Join Soft Launch"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
