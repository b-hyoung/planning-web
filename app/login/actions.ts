"use server";

import { redirect } from "next/navigation";
import { getSession, getAppPassword } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const input = String(formData.get("password") ?? "");
  if (input !== getAppPassword()) {
    return { error: "비밀번호가 틀렸어요." };
  }
  const session = await getSession();
  session.loggedIn = true;
  await session.save();
  redirect("/board");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
