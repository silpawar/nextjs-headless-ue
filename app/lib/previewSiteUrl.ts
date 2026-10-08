import "server-only";

/** Origin of this Next.js app for the current request (e.g. https://my-app.vercel.app). */
export function getSiteOrigin(requestHeaders: Headers): string {
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    requestHeaders.get("host");
  if (!host) {
    return "";
  }

  const proto =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${proto}://${host}`;
}

/**
 * Maps the current app path to the public preview URL on the same host.
 * /content/... → /preview/content/...
 * /ue/content/... → /preview/content/...
 * /preview/... → unchanged
 */
export function toPreviewSiteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (path.startsWith("/preview/") || path === "/preview") {
    return `${origin.replace(/\/$/, "")}${path}`;
  }

  if (path.startsWith("/ue/")) {
    return `${origin.replace(/\/$/, "")}/preview${path.slice(3)}`;
  }

  return `${origin.replace(/\/$/, "")}/preview${path}`;
}
