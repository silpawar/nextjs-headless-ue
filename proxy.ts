import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isUniversalEditorRequest } from "./app/lib/universalEditor";

function withAppPathname(
  request: NextRequest,
  requestHeaders: Headers,
): Headers {
  requestHeaders.set("x-app-pathname", request.nextUrl.pathname);
  return requestHeaders;
}

function withUeRequestHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ue-request", "1");
  requestHeaders.set("x-aem-target", "author");
  return withAppPathname(request, requestHeaders);
}

function withPublishTargetHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aem-target", "publish");
  return withAppPathname(request, requestHeaders);
}

function withPreviewRequestHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-preview-request", "1");
  requestHeaders.set("x-aem-target", "preview");
  return withAppPathname(request, requestHeaders);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUe = isUniversalEditorRequest(request.headers);

  if (pathname.startsWith("/ue") && !isUe) {
    return new NextResponse(null, { status: 404 });
  }

  // Public preview tier — no UE referer / iframe check (unlike /ue/*).
  if (pathname.startsWith("/preview")) {
    return NextResponse.next({
      request: { headers: withPreviewRequestHeader(request) },
    });
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
  matcher: ["/content/:path*", "/ue/:path*", "/preview/:path*"],
};
