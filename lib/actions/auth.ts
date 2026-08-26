"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/firebase/session";

export async function signOut() {
  const store = await cookies();
  store.set({ ...sessionCookieOptions(), name: SESSION_COOKIE, value: "", maxAge: 0 });
  redirect("/login");
}
