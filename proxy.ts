import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isUniversalEditorRequest } from "./app/lib/universalEditor";

function withUeRequestHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ue-request", "1");
  requestHeaders.set("x-aem-target", "author");
  return requestHeaders;
}

function withPublishTargetHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aem-target", "publish");
  return requestHeaders;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUe = isUniversalEditorRequest(request.headers);

  if (pathname.startsWith("/ue") && !isUe) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/content") && isUe) {
    const url = request.nextUrl.clone();
    url.pathname = `/ue${pathname}`;

    return NextResponse.rewrite(url, {
      request: { headers: withUeRequestHeader(request) },
    });
  }

  if (pathname.startsWith("/ue") && isUe) {
    return NextResponse.next({
      request: { headers: withUeRequestHeader(request) },
    });
  }

  if (pathname.startsWith("/content")) {
    return NextResponse.next({
      request: { headers: withPublishTargetHeader(request) },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/content/:path*", "/ue/:path*"],
};
