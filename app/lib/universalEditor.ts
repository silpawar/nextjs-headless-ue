import "server-only";
import { headers } from "next/headers";

/**
 * List of hosts that are allowed to embed this app inside an iframe as the Universal Editor.
 */
const DEFAULT_UE_REFERER_HOSTS = ["experience.adobe.com"];

function getAllowedRefererHosts(): string[] {
  const configured = (process.env.UE_ALLOWED_REFERER_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([...DEFAULT_UE_REFERER_HOSTS, ...configured])];
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
 * Detects, on the server, whether the current request is being rendered inside
 * the AEM Universal Editor (author / edit mode).
 *
 * It will return `true` if:
 *  - The request is loaded in an iframe (`sec-fetch-dest: iframe`) AND the
 *    referring host is an allowed Universal Editor host.
 *
 * When this returns `true` the app is in author mode and GraphQL/content calls
 * should target the AEM author instance with authorization.
 */
export async function isUniversalEditorRequest(): Promise<boolean> {
  // Iframe + trusted Universal Editor referer.
  const headersList = await headers();
  console.log("-----Request headers:-------");
  for (const [key, value] of headersList.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log("----------------------------");
  const secFetchDest = headersList.get("sec-fetch-dest");
  const referer =
    headersList.get("referer") ?? headersList.get("origin") ?? null;

  const inIframe = secFetchDest === "iframe";
  if (inIframe && refererIsUniversalEditor(referer)) {
    return true;
  }

  return false;
}
