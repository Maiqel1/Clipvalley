import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/firebase/route-guard";

export async function proxy(request: NextRequest) {
  try {
    return await guard(request);
  } catch (error) {
    // A proxy throw 500s every route, including static pages that need no
    // backend at all. Log it and let the request through instead; protected
    // pages still redirect on their own server-side session check.
    console.error("proxy: route guard failed", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*[.](?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
