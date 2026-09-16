import type { AemTarget } from "./aem-client";

/** Author / UE content must be rendered on every request (no static shell). */
export function isPerRequestAemTarget(target: AemTarget): boolean {
  return target === "author" || target === "preview";
}
