import 'server-only';
import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const AEM_BASE = process.env.AEM_HOST!;
const AEM_GRAPHQL_PROJECT = process.env.AEM_GRAPHQL_PROJECT ?? 'wknd-shared';

type DeveloperConsoleCredentials = {
  accessToken?: string;
  integration: {
    id: string;
    org: string;
    metascopes: string;
    imsEndpoint: string;
    privateKey: string;
    technicalAccount: {
      clientId: string;
      clientSecret: string;
    };
  };
};

function getDeveloperConsoleCredentials(): DeveloperConsoleCredentials {
  const inlineAccessToken = process.env.AEM_ACCESS_TOKEN?.trim();
  if (inlineAccessToken) {
    return { accessToken: inlineAccessToken, integration: {} as never };
  }

  const inlineServiceToken = process.env.AEM_SERVICE_TOKEN_JSON?.trim();
  if (inlineServiceToken) {
    return JSON.parse(inlineServiceToken) as DeveloperConsoleCredentials;
  }

  const localTokenPath = join(process.cwd(), 'app', 'service-token.json');
  if (existsSync(localTokenPath)) {
    const fileContents = readFileSync(localTokenPath, 'utf8');
    return JSON.parse(fileContents) as DeveloperConsoleCredentials;
  }

  throw new Error(
    'Missing AEM credentials. Set AEM_SERVICE_TOKEN_JSON or AEM_ACCESS_TOKEN in CI, or provide a local app/service-token.json file.'
  );
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signJwt(payload: Record<string, unknown>, privateKey: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(privateKey);
  return `${signingInput}.${toBase64Url(signature)}`;
}

async function exchangeJwtForAccessToken(
  ims: string,
  clientId: string,
  clientSecret: string,
  jwtToken: string
): Promise<string> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    jwt_token: jwtToken,
  });

  const response = await fetch(`${ims}/ims/exchange/jwt/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !json.access_token) {
    const message =
      json.error_description ??
      json.error ??
      `IMS token exchange failed with status ${response.status}`;
    throw new Error(message);
  }

  return json.access_token;
}

async function getAccessToken(
  developerConsoleCredentials: DeveloperConsoleCredentials
): Promise<string> {
  if (developerConsoleCredentials.accessToken) {
    return developerConsoleCredentials.accessToken;
  }

  const serviceCredentials = developerConsoleCredentials.integration;
  const ims = `https://${serviceCredentials.imsEndpoint}`;
  const clientId = serviceCredentials.technicalAccount.clientId;
  const clientSecret = serviceCredentials.technicalAccount.clientSecret;
  const metaScopes = serviceCredentials.metascopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);

  const jwtPayload: Record<string, string | number | boolean> = {
    exp: Math.round(Date.now() / 1000) + 300,
    iss: serviceCredentials.org,
    sub: serviceCredentials.id,
    aud: `${ims}/c/${clientId}`,
  };

  for (const scope of metaScopes) {
    jwtPayload[
      scope.startsWith('https') ? scope : `${ims}/s/${scope}`
    ] = true;
  }

  const jwtToken = signJwt(jwtPayload, serviceCredentials.privateKey);
  return exchangeJwtForAccessToken(ims, clientId, clientSecret, jwtToken);
}

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
  const developerConsoleCredentials = getDeveloperConsoleCredentials();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${await getAccessToken(developerConsoleCredentials)}`,
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

export async function queryAEM<T>(
  queryName: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return fetchFromAEM<T>(queryName, variables);
}