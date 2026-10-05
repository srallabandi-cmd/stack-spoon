import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomToken, sha256 } from "@/lib/server/crypto-box";
import { addPartner, saveMagicLink } from "@/lib/server/db";
import { appUrl, requireDatabaseInProd } from "@/lib/server/env";
import { clientIp, rateLimited } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const OWNER_TO = "rallabandiai@gmail.com";

function isTestingOnly(message: string | undefined) {
  return (message ?? "").includes("own email address");
}

export async function POST(req: Request) {
  const dbErr = requireDatabaseInProd();
  if (dbErr) {
    return NextResponse.json({ error: dbErr }, { status: 503 });
  }
  if (rateLimited(`auth:${clientIp(req)}`, 8)) {
    return NextResponse.json(
      { error: "Too many sign-in requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { email?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await saveMagicLink(sha256(token), email, expiresAt);

  try {
    await addPartner({
      email,
      name: "",
      notes: "Invite sign-in request",
    });
  } catch (err) {
    console.error("invite partner save", err);
  }

  const next = typeof body.next === "string" && body.next.startsWith("/") ? body.next : "/start";
  const verify = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Stack Spoon <onboarding@resend.dev>";
  const ownerTo = process.env.CONTACT_TO_EMAIL?.trim() || OWNER_TO;
  const apiKey = process.env.RESEND_API_KEY?.trim();

  let emailed = false;
  let testingOnly = false;

  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: "[Stack Spoon] Your sign-in link",
      text: `Sign in to Stack Spoon (expires in 15 minutes):\n\n${verify}\n\nIf you did not request this, ignore the email.`,
    });
    if (error) {
      testingOnly = isTestingOnly(error.message);
      console.error("magic link send", error);
    } else {
      emailed = true;
    }

    if (email !== ownerTo.toLowerCase()) {
      const { error: notifyError } = await resend.emails.send({
        from,
        to: [ownerTo],
        subject: `[Stack Spoon] Invite request — ${email}`,
        text: `${email} requested a Soft Launch invite.\n\nSign-in email sent to them: ${emailed ? "yes" : "no"}${
          testingOnly
            ? "\n\nResend is still in test mode, so only the account owner can receive magic links until a sending domain is verified."
            : ""
        }`,
      });
      if (notifyError) {
        console.error("invite notify send", notifyError);
      }
    }
  }

  const payload: {
    ok: true;
    emailed: boolean;
    inviteSaved: true;
    testingOnly?: boolean;
    devLink?: string;
  } = {
    ok: true,
    emailed,
    inviteSaved: true,
  };
  if (testingOnly) payload.testingOnly = true;
  if (!emailed && process.env.NODE_ENV !== "production") {
    payload.devLink = verify;
  }

  return NextResponse.json(payload);
}
