"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BrandLockup } from "@/components/Brand";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  designPartner: boolean;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  designPartner: false,
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your message.");
        return;
      }
      setSent(true);
      setForm(initial);
    } catch {
      setError("Could not reach the server. Try again.");
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
        <Link href="/privacy" className="link-quiet">
          Privacy
        </Link>
      </nav>

      <main className="contact-main">
        <div className="panel contact-panel">
          <p className="eyebrow">Contact</p>
          <h1>Tell us where to reach you</h1>
          <p className="lede">
            A short note is enough. We read every message and reply when we can
            help.
          </p>

          {sent ? (
            <div className="contact-success">
              <h2>Message sent</h2>
              <p>Thanks. We will get back to you at the email you provided.</p>
              <div className="actions-row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSent(false)}
                >
                  Send another
                </button>
                <Link href="/start" className="btn btn-primary">
                  Start with your role
                </Link>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="contact-grid">
                <label className="contact-field">
                  <span>First name</span>
                  <input
                    required
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </label>
                <label className="contact-field">
                  <span>Last name</span>
                  <input
                    required
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>

              <label className="contact-field">
                <span>Phone <em className="optional">(optional)</em></span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </label>

              <label className="contact-field">
                <span>Anything else we should know</span>
                <textarea
                  rows={6}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Role, company, what you are trying to solve…"
                />
              </label>

              <label className="addon-toggle">
                <input
                  type="checkbox"
                  checked={form.designPartner}
                  onChange={(e) => update("designPartner", e.target.checked)}
                />
                I want to be a Soft Launch design partner (AI-PM / Slack + Linear)
              </label>

              {error ? <p className="diagnose-error">{error}</p> : null}

              <div className="actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
