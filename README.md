This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AEM Configuration

Set these environment variables for local development:

- `AEM_PUBLISH_HOST`: your AEM publish host, for example `https://publish-xxxx.adobeaemcloud.com`
- `AEM_AUTHOR_HOST`: your AEM author host, for example `https://author-xxxx.adobeaemcloud.com` (used when `aemTarget` is `author`, e.g. `/ue/content/*`)
- **Author IMS (server only)** — copy `.env.example` and set:
  - `AEM_IMS_ENDPOINT`, `AEM_IMS_CLIENT_ID`, `AEM_IMS_CLIENT_SECRET`, `AEM_IMS_ORG_ID`, `AEM_IMS_TECHNICAL_ACCOUNT_ID`, `AEM_IMS_METASCOPES` (e.g. `ent_aem_cloud_api`)
  - `AEM_IMS_PRIVATE_KEY` — PEM private key from Developer Console (in `.env`, use `\n` for line breaks inside quotes). Optional fallback: `AEM_IMS_PRIVATE_KEY_PATH`
  - Ensure the technical account has access to your AEM program; rotate credentials if they are ever committed or shared
- `AEM_PREVIEW_HOST`: optional preview host if you use a `preview` AEM target elsewhere
- `AEM_GRAPHQL_PROJECT`: optional, defaults to `wknd-shared`
- `AEM_REVALIDATE_SECONDS`: optional publish cache lifetime in seconds, defaults to `3600`
- `UE_ALLOWED_REFERER_HOSTS`: optional extra comma-separated parent hostnames. `experience.adobe.com` and the hostname from `AEM_AUTHOR_HOST` (AEM in-context UE, e.g. `author-….adobeaemcloud.com`) are always allowed.

### Author / Universal Editor rendering

Routes under `/ue/*` use **SSR per request** (`force-dynamic`, `revalidate = 0`). Author AEM calls use `cache: no-store` and `unstable_noStore()` in `PageContent`. GraphQL and bottom experience fragments are fetched on the server for each request; publish routes may still use static generation and client-side XF loading.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
