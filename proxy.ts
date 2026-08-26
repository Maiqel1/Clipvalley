import type { NextRequest } from "next/server";
import { guard } from "@/lib/firebase/route-guard";

export async function proxy(request: NextRequest) {
  return guard(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*[.](?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
