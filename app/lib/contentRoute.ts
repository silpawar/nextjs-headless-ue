// import "server-only";

// import { resolvePageContent, type PageContentConfig } from "./pageContent";

// const STEP_SEGMENT_PATTERN = /^step-([1-4])$/;

// export type ContentRoute = {
//   config: PageContentConfig;
//   authorStep?: number;
// };

// export function resolveContentRoute(slug: string[]): ContentRoute | null {
//   const pagePath = `/content/${slug.join("/")}`;
//   const stepSegment = slug.at(-1);
//   const stepMatch = stepSegment?.match(STEP_SEGMENT_PATTERN);
//   const authorStep = stepMatch ? Number.parseInt(stepMatch[1], 10) : undefined;
//   const config = resolvePageContent(
//     authorStep === undefined
//       ? pagePath
//       : `/content/${slug.slice(0, -1).join("/")}`,
//   );

//   return config ? { config, authorStep } : null;
// }
