import "server-only";
import type { AemTarget } from "./aem-client";
import { getAemAuthorAuthorizationHeader } from "./aem-ims-auth";

export async function buildAemRequestHeaders(
  target: AemTarget,
  headers: Record<string, string>,
): Promise<Record<string, string>> {
  if (target !== "author") {
    return headers;
  }

  const authorization = await getAemAuthorAuthorizationHeader();
  return {
    ...headers,
    Authorization: authorization,
  };
}
