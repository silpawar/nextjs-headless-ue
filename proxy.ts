import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isUniversalEditorRequest } from "./app/lib/universalEditor";

export function proxy(request: NextRequest) {
  if (!isUniversalEditorRequest(request.headers)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/ue${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/content/:path*",
};
