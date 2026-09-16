/**
 * Hostnames allowed as Referer/Origin when the app is embedded in Universal Editor.
 * - Adobe Experience Cloud: experience.adobe.com
 * - AEM in-context UE: author-*.adobeaemcloud.com (from AEM_AUTHOR_HOST)
 */
const DEFAULT_UE_REFERER_HOSTS = ["experience.adobe.com"];

function hostnameFromEnvUrl(envName: string): string | null {
  const raw = process.env[envName]?.trim();
  if (!raw) {
    return null;
  }

  try {
    const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getAllowedRefererHosts(): string[] {
  const configured = (process.env.UE_ALLOWED_REFERER_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  const authorHost = hostnameFromEnvUrl("AEM_AUTHOR_HOST");

  return [
    ...new Set([
      ...DEFAULT_UE_REFERER_HOSTS,
      ...(authorHost ? [authorHost] : []),
      ...configured,
    ]),
  ];
}

function hostMatches(host: string, allowed: string[]): boolean {
  const normalized = host.toLowerCase();
  return allowed.some(
    (candidate) =>
      normalized === candidate || normalized.endsWith(`.${candidate}`),
  );
}

function refererIsUniversalEditor(referer: string | null): boolean {
  if (!referer) {
    return false;
  }

  try {
    const { hostname } = new URL(referer);
    return hostMatches(hostname, getAllowedRefererHosts());
  } catch {
    return false;
  }
}

/**
 * Identifies requests embedded by the Universal Editor before route rendering.
 */
export function isUniversalEditorRequest(requestHeaders: Headers): boolean {
  const secFetchDest = requestHeaders.get("sec-fetch-dest");
  const referer =
    requestHeaders.get("referer") ?? requestHeaders.get("origin") ?? null;

  return secFetchDest === "iframe" && refererIsUniversalEditor(referer);
}
