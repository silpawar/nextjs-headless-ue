import "server-only";
import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import jwt from "jsonwebtoken";

type CachedToken = {
  accessToken: string;
  expiresAtMs: number;
};

type ImsTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

let cachedToken: CachedToken | null = null;
let tokenRequest: Promise<string> | null = null;

const TOKEN_REFRESH_BUFFER_MS = 60_000;
const DEFAULT_IMS_ENDPOINT = "https://ims-na1.adobelogin.com";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePrivateKeyPem(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
}

function resolvePrivateKey(): string {
  const inlineKey = process.env.AEM_IMS_PRIVATE_KEY?.trim();
  if (inlineKey) {
    return normalizePrivateKeyPem(inlineKey);
  }

  const keyPath = process.env.AEM_IMS_PRIVATE_KEY_PATH?.trim();
  if (keyPath) {
    const absolutePath = isAbsolute(keyPath)
      ? keyPath
      : resolve(process.cwd(), keyPath);
    return normalizePrivateKeyPem(readFileSync(absolutePath, "utf8"));
  }

  throw new Error(
    "Missing AEM_IMS_PRIVATE_KEY (PEM string; use \\n for line breaks in .env).",
  );
}

function resolveMetaScopes(): string[] {
  const raw = requireEnv("AEM_IMS_METASCOPES");
  return raw
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function resolveImsEndpoint(): string {
  const endpoint = process.env.AEM_IMS_ENDPOINT?.trim();
  if (!endpoint) {
    return DEFAULT_IMS_ENDPOINT;
  }

  return endpoint.startsWith("https://")
    ? endpoint.replace(/\/$/, "")
    : `https://${endpoint.replace(/\/$/, "")}`;
}

function buildJwtPayload(
  ims: string,
  orgId: string,
  technicalAccountId: string,
  clientId: string,
  metaScopes: string[],
): jwt.JwtPayload {
  const payload: jwt.JwtPayload = {
    exp: Math.round(Date.now() / 1000 + 300),
    iss: orgId,
    sub: technicalAccountId,
    aud: `${ims}/c/${clientId}`,
  };

  for (const scope of metaScopes) {
    if (scope.includes("https://")) {
      payload[scope] = true;
    } else {
      payload[`${ims}/s/${scope}`] = true;
    }
  }

  return payload;
}

function signJwt(
  payload: jwt.JwtPayload,
  privateKey: string,
  passphrase?: string,
): string {
  const signKey = passphrase
    ? { key: privateKey, passphrase }
    : privateKey;

  return jwt.sign(payload, signKey, { algorithm: "RS256" });
}

async function requestAccessToken(): Promise<string> {
  const ims = resolveImsEndpoint();
  const clientId = requireEnv("AEM_IMS_CLIENT_ID");
  const clientSecret = requireEnv("AEM_IMS_CLIENT_SECRET");
  const technicalAccountId = requireEnv("AEM_IMS_TECHNICAL_ACCOUNT_ID");
  const orgId = requireEnv("AEM_IMS_ORG_ID");
  const privateKey = resolvePrivateKey();
  const passphrase = process.env.AEM_IMS_PRIVATE_KEY_PASSPHRASE?.trim();

  const jwtToken = signJwt(
    buildJwtPayload(
      ims,
      orgId,
      technicalAccountId,
      clientId,
      resolveMetaScopes(),
    ),
    privateKey,
    passphrase || undefined,
  );

  const form = new FormData();
  form.append("client_id", clientId);
  form.append("client_secret", clientSecret);
  form.append("jwt_token", jwtToken);

  const res = await fetch(`${ims}/ims/exchange/jwt/`, {
    method: "POST",
    body: form,
  });

  const json = (await res.json()) as ImsTokenResponse;

  if (!res.ok || !json.access_token) {
    const detail =
      json.error_description ?? json.error ?? `HTTP ${res.status}`;
    throw new Error(`Adobe IMS JWT exchange failed: ${detail}`);
  }

  const expiresIn = json.expires_in ?? 3600;
  cachedToken = {
    accessToken: json.access_token,
    expiresAtMs: Date.now() + expiresIn * 1000,
  };

  return json.access_token;
}

export async function getAemAuthorAccessToken(): Promise<string> {
  if (
    cachedToken &&
    cachedToken.expiresAtMs - TOKEN_REFRESH_BUFFER_MS > Date.now()
  ) {
    return cachedToken.accessToken;
  }

  if (!tokenRequest) {
    tokenRequest = requestAccessToken().finally(() => {
      tokenRequest = null;
    });
  }

  return tokenRequest;
}

export async function getAemAuthorAuthorizationHeader(): Promise<string> {
  const accessToken = await getAemAuthorAccessToken();
  return `Bearer ${accessToken}`;
}
