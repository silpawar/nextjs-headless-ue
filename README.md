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

Set these environment variables for local development and CI:

- `AEM_HOST`: your AEM host, for example `https://publish-xxxx.adobeaemcloud.com`
- `AEM_GRAPHQL_PROJECT`: optional, defaults to `wknd-shared`

GitHub Actions example:

```yaml
env:
	AEM_HOST: ${{ secrets.AEM_HOST }}
	AEM_GRAPHQL_PROJECT: wknd-shared
```

## GitHub Pages

This project is configured to publish a static export to GitHub Pages from `.github/workflows/deploy-github-pages.yml`.

Required repository secrets:

- `AEM_HOST`
- `AEM_GRAPHQL_PROJECT` (optional, defaults to `wknd-shared` in the workflow)

Notes:

- The AEM content is fetched at build time in CI, then emitted as static files in `out/`.
- GitHub Pages does not run a Next.js server, so any server-side AEM fetches happen only during the build.
- If AEM content changes, redeploy GitHub Pages to rebuild the static output.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
