import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addPartner } from "@/lib/server/db";
import { clientIp, rateLimited } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const DEFAULT_TO = "rallabandiai@gmail.com";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  if (rateLimited(`contact:${clientIp(req)}`, 8)) {
    return NextResponse.json(
      { error: "Too many contact requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Contact email is not configured yet. Set RESEND_API_KEY in web/.env.local.",
      },
      { status: 503 }
    );
  }

  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    designPartner?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const notes = (body.notes ?? "").trim();
  const designPartner = Boolean(body.designPartner);

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "First name, last name, and email are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (notes.length > 4000) {
    return NextResponse.json(
      { error: "Keep the note under 4000 characters." },
      { status: 400 }
    );
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Stack Spoon <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const subject = `[Stack Spoon] Contact — ${firstName} ${lastName}`;
  const text = [
    `First name: ${firstName}`,
    `Last name: ${lastName}`,
    `Email: ${email}`,
    `Phone: ${phone || "(not provided)"}`,
    `Design partner interest: ${designPartner ? "yes" : "no"}`,
    "",
    "Anything else we should know:",
    notes || "(none)",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      text,
    });
    if (error) {
      console.error("contact resend error", error);
      return NextResponse.json(
        { error: "Could not send your message. Try again shortly." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("contact send failed", err);
    return NextResponse.json(
      { error: "Could not send your message. Try again shortly." },
      { status: 502 }
    );
  }

  if (designPartner) {
    try {
      await addPartner({
        email,
        name: `${firstName} ${lastName}`,
        notes,
      });
    } catch (err) {
      console.error("partner save", err);
    }
  }

  return NextResponse.json({ ok: true });
}
