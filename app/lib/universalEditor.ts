// import "server-only";
// import { headers } from "next/headers";
//
// /**
//  * List of hosts that are allowed to embed this app inside an iframe as the Universal Editor.
//  */
// const DEFAULT_UE_REFERER_HOSTS = ["experience.adobe.com", ""];
//
// function getAllowedRefererHosts(): string[] {
//   const configured = (process.env.UE_ALLOWED_REFERER_HOSTS ?? "")
//     .split(",")
//     .map((host) => host.trim().toLowerCase())
//     .filter(Boolean);
//
//   return [...new Set([...DEFAULT_UE_REFERER_HOSTS, ...configured])];
// }
//
// function hostMatches(host: string, allowed: string[]): boolean {
//   const normalized = host.toLowerCase();
//   return allowed.some(
//     (candidate) =>
//       normalized === candidate || normalized.endsWith(`.${candidate}`),
//   );
// }
//
// function refererIsUniversalEditor(referer: string | null): boolean {
//   if (!referer) {
//     return false;
//   }
//
//   try {
//     const { hostname } = new URL(referer);
//     return hostMatches(hostname, getAllowedRefererHosts());
//   } catch {
//     return false;
//   }
// }
//
// /**
//  * Detects, on the server, whether the current request is being rendered inside
//  * the AEM Universal Editor (author / edit mode).
//  */
// export async function isUniversalEditorRequest(): Promise<boolean> {
//   const headersList = await headers();
//   const secFetchDest = headersList.get("sec-fetch-dest");
//   const referer =
//     headersList.get("referer") ?? headersList.get("origin") ?? null;
//
//   return secFetchDest === "iframe" && refererIsUniversalEditor(referer);
// }
