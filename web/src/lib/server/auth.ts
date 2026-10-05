import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authSecret } from "./env";
import { upsertUserByEmail, type UserRow } from "./db";

const COOKIE = "ss_session";

function secretKey() {
  return new TextEncoder().encode(authSecret());
}

export async function signSession(user: UserRow): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSessionFromCookie(
  token?: string | null
): Promise<UserRow | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      createdAt: "",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserRow | null> {
  const jar = await cookies();
  return readSessionFromCookie(jar.get(COOKIE)?.value);
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function requireSession(): Promise<
  { user: UserRow } | { response: NextResponse }
> {
  const user = await getSession();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }
  return { user };
}

export async function sessionFromEmail(email: string): Promise<string> {
  const user = await upsertUserByEmail(email);
  return signSession(user);
}
