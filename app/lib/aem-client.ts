import 'server-only';

const AEM_BASE = process.env.AEM_HOST!;
const AEM_GRAPHQL_PROJECT = process.env.AEM_GRAPHQL_PROJECT ?? 'wknd-shared';

async function fetchFromAEM<T>(
  queryName: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!queryName) {
    throw new Error('AEM queryName is required for persisted queries.');
  }

  const params = Object.entries(variables ?? {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const value = String(v);

      // AEM persisted queries expect repository paths with literal '/'.
      const encodedValue =
        typeof v === 'string' && value.startsWith('/')
          ? value
          : encodeURIComponent(value);

      return `;${k}=${encodedValue}`;
    })
    .join('');

  const url = `${AEM_BASE}/graphql/execute.json/${AEM_GRAPHQL_PROJECT}/${encodeURIComponent(queryName)}${params}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    next: { revalidate: 3600 },
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
      `AEM GraphQL errors for ${queryName}: ${JSON.stringify(json.errors)}`
    );
  }

  if (json.data == null) {
    throw new Error(`AEM GraphQL returned no data for ${queryName}`);
  }

  return json.data;
}

export async function fetchExperienceFragment(path: string): Promise<string> {
  if (!path) {
    throw new Error('Experience Fragment path is required.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = normalizedPath.endsWith('.html')
    ? `${AEM_BASE}${normalizedPath}`
    : `${AEM_BASE}${normalizedPath}.plain.html`;

  const res = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'ngrok-skip-browser-warning': 'true',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AEM Experience Fragment fetch failed: ${res.status} ${url} ${body}`);
  }

  return res.text();
}

export async function fetchXf(): Promise<string> {
  return fetchExperienceFragment(
    '/content/experience-fragments/wknd/language-masters/en/featured/camping-western-australia/master'
  );
}

export async function queryAEM<T>(
  queryName: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return fetchFromAEM<T>(queryName, variables);
}
