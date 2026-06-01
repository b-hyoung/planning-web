import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";

export interface SessionData {
  loggedIn?: boolean;
}

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return {
    password,
    cookieName: "wp_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.loggedIn;
}

export function getAppPassword(): string {
  const pw = process.env.APP_PASSWORD;
  if (!pw) throw new Error("APP_PASSWORD env var not set");
  return pw;
}
