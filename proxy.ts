import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/firebase/route-guard";

export function proxy(request: NextRequest) {
  try {
    return guard(request);
  } catch (error) {
    console.error("proxy: route guard failed", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*[.](?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
