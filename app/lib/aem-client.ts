import "server-only";

const AEM_BASE = process.env.AEM_HOST!;
const AEM_AUTHOR_BASE = process.env.AEM_AUTHOR_HOST;
const AEM_GRAPHQL_PROJECT = process.env.AEM_GRAPHQL_PROJECT ?? "wknd-shared";

export type AemRequestOptions = {
  /**
   * When `true`, the request targets the AEM author instance
   * (`AEM_AUTHOR_HOST`) with authorization so that unpublished / in-progress
   * content is returned. Used when rendering inside the Universal Editor.
   */
  authorMode?: boolean;
};

/**
 * Resolves the base host to use for a request. Author mode prefers
 * `AEM_AUTHOR_HOST` and falls back to `AEM_HOST` when it is not configured.
 */
function resolveBase(authorMode: boolean): string {
  if (authorMode) {
    if (!AEM_AUTHOR_BASE) {
      console.warn(
        "Author mode requested but AEM_AUTHOR_HOST is not set; falling back to AEM_HOST.",
      );
      return AEM_BASE;
    }
    return AEM_AUTHOR_BASE;
  }
  return AEM_BASE;
}

/**
 * Builds the authorization header for author-instance requests.
 * Supports a bearer token.
 */
function buildAuthHeaders(authorMode: boolean): Record<string, string> {
  if (!authorMode) {
    return {};
  }

  const token = process.env.AEM_AUTHOR_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  console.warn(
    "Author mode requested but no AEM author credentials configured " +
      "(set AEM_AUTHOR_TOKEN).",
  );
  return {};
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

  const authorMode = options.authorMode ?? false;
  const base = resolveBase(authorMode);

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
  console.log(
    `Fetching AEM GraphQL query (${authorMode ? "author" : "publish"}): URL: ${url}`,
  );

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...buildAuthHeaders(authorMode),
    },
    next: { revalidate: 0 },
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

  const authorMode = options.authorMode ?? false;
  const base = resolveBase(authorMode);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalizedPath.endsWith(".html")
    ? `${base}${normalizedPath}`
    : `${base}${normalizedPath}.plain.html`;

  const res = await fetch(url, {
    headers: {
      Accept: "text/html",
      "ngrok-skip-browser-warning": "true",
      ...buildAuthHeaders(authorMode),
    },
    // Only cache publish content.
    next: { revalidate: authorMode ? 0 : 3600 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `AEM Experience Fragment fetch failed: ${res.status} ${url} ${body}`,
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
