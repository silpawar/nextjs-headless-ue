import "server-only";
import { buildAemRequestHeaders } from "./aem-fetch-headers";

const AEM_GRAPHQL_PROJECT = process.env.AEM_GRAPHQL_PROJECT ?? "wknd-shared";
const PUBLISH_REVALIDATE_SECONDS = Number.parseInt(
  process.env.AEM_REVALIDATE_SECONDS ?? "3600",
  10,
);

export type AemTarget = "publish" | "preview" | "author";

export type AemRequestOptions = {
  target?: AemTarget;
};

function isUncachedTarget(target: AemTarget): boolean {
  return target === "preview" || target === "author";
}

export function getAemBaseUrl(target: AemTarget = "publish"): string {
  return resolveBase(target);
}

function resolveBase(target: AemTarget): string {
  const base =
    target === "author"
      ? process.env.AEM_AUTHOR_HOST
      : target === "preview"
        ? process.env.AEM_PREVIEW_HOST
        : process.env.AEM_PUBLISH_HOST;

  if (!base) {
    const envName =
      target === "author"
        ? "AEM_AUTHOR_HOST"
        : target === "preview"
          ? "AEM_PREVIEW_HOST"
          : "AEM_PUBLISH_HOST";
    throw new Error(`Missing ${envName}.`);
  }

  return base;
}

function publishCacheTag(
  queryName: string,
  variables: Record<string, unknown> | undefined,
): string {
  const path = variables?.path;
  return typeof path === "string" ? `aem:cf:${path}` : `aem:query:${queryName}`;
}

function resolveAssetUrl(value: string, base: string): string {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("javascript:")
  ) {
    return value;
  }

  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function resolveExperienceFragmentAssetUrls(
  html: string,
  base: string,
): string {
  const resolveSrcSet = (srcSet: string) =>
    srcSet
      .split(",")
      .map((candidate) => {
        const [url, ...descriptors] = candidate.trim().split(/\s+/);
        return [resolveAssetUrl(url, base), ...descriptors].join(" ");
      })
      .join(", ");

  return html
    .replace(/\bsrc=(['"])(.*?)\1/gi, (_match, quote, src) => {
      return `src=${quote}${resolveAssetUrl(src, base)}${quote}`;
    })
    .replace(/\bsrcset=(['"])(.*?)\1/gi, (_match, quote, srcSet) => {
      return `srcset=${quote}${resolveSrcSet(srcSet)}${quote}`;
    });
}

async function fetchFromAEM<T>(
  queryName: string,
  variables?: Record<string, unknown>,
  options: AemRequestOptions = {},
): Promise<T> {
  if (!queryName) {
    throw new Error("AEM queryName is required for persisted queries.");
  }

  const target = options.target ?? "publish";
  const base = resolveBase(target);

  const params = Object.entries(variables ?? {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const value = String(v);

      // AEM persisted queries expect repository paths with literal '/'.
      const encodedValue =
        typeof v === "string" && value.startsWith("/")
          ? value
          : encodeURIComponent(value);

      return `;${k}=${encodedValue}`;
    })
    .join("");

  const url = `${base}/graphql/execute.json/${AEM_GRAPHQL_PROJECT}/${encodeURIComponent(queryName)}${params}`;
  console.log(`Fetching AEM GraphQL query (${target}): URL: ${url}`);

  const requestHeaders = await buildAemRequestHeaders(target, {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  });

  const res = await fetch(url, {
    headers: requestHeaders,
    ...(isUncachedTarget(target)
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: PUBLISH_REVALIDATE_SECONDS,
            tags: [publishCacheTag(queryName, variables)],
          },
        }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AEM query failed: ${res.status} ${url} ${body}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{
      errorType?: string;
      message?: string;
      details?: string;
    }>;
  };

  if (json.errors?.length) {
    throw new Error(
      `AEM GraphQL errors for ${queryName}: ${JSON.stringify(json.errors)}`,
    );
  }

  if (json.data == null) {
    throw new Error(`AEM GraphQL returned no data for ${queryName}`);
  }

  return json.data;
}

export async function fetchExperienceFragment(
  path: string,
  options: AemRequestOptions = {},
): Promise<string> {
  if (!path) {
    throw new Error("Experience Fragment path is required.");
  }

  const target = options.target ?? "publish";
  const base = resolveBase(target);

  if (
    !path.startsWith("/content/experience-fragments/") ||
    path.includes("://")
  ) {
    throw new Error("Invalid Experience Fragment path.");
  }

  const url = new URL(path, base);
  url.pathname = url.pathname.endsWith(".plain.html")
    ? url.pathname
    : url.pathname.replace(/(?:\.html)?$/, ".plain.html");

  const requestHeaders = await buildAemRequestHeaders(target, {
    Accept: "text/html",
    "ngrok-skip-browser-warning": "true",
  });

  const res = await fetch(url, {
    headers: requestHeaders,
    ...(isUncachedTarget(target)
      ? { cache: "no-store" as const }
      : { next: { revalidate: PUBLISH_REVALIDATE_SECONDS } }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `AEM Experience Fragment fetch failed: ${res.status} ${url.toString()} ${body}`,
    );
  }

  return resolveExperienceFragmentAssetUrls(await res.text(), base);
}

export async function fetchXf(): Promise<string> {
  return fetchExperienceFragment(
    "/content/experience-fragments/wknd/language-masters/en/featured/camping-western-australia/master",
  );
}

export async function queryAEM<T>(
  queryName: string,
  variables?: Record<string, unknown>,
  options: AemRequestOptions = {},
): Promise<T> {
  return fetchFromAEM<T>(queryName, variables, options);
}
