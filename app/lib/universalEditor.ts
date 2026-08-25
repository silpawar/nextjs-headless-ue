// const DEFAULT_UE_REFERER_HOSTS = ["experience.adobe.com"];

// function getAllowedRefererHosts(): string[] {
//   const configured = (process.env.UE_ALLOWED_REFERER_HOSTS ?? "")
//     .split(",")
//     .map((host) => host.trim().toLowerCase())
//     .filter(Boolean);

//   return [...new Set([...DEFAULT_UE_REFERER_HOSTS, ...configured])];
// }

// function hostMatches(host: string, allowed: string[]): boolean {
//   const normalized = host.toLowerCase();
//   return allowed.some(
//     (candidate) =>
//       normalized === candidate || normalized.endsWith(`.${candidate}`),
//   );
// }

// function refererIsUniversalEditor(referer: string | null): boolean {
//   if (!referer) {
//     return false;
//   }

//   try {
//     const { hostname } = new URL(referer);
//     return hostMatches(hostname, getAllowedRefererHosts());
//   } catch {
//     return false;
//   }
// }

// /**
//  * Identifies requests embedded by the Universal Editor before route rendering.
//  * This is a routing signal only; preview AEM remains a publicly accessible host.
//  */
// export function isUniversalEditorRequest(requestHeaders: Headers): boolean {
//   const secFetchDest = requestHeaders.get("sec-fetch-dest");
//   const referer =
//     requestHeaders.get("referer") ?? requestHeaders.get("origin") ?? null;

//   return secFetchDest === "iframe" && refererIsUniversalEditor(referer);
// }
