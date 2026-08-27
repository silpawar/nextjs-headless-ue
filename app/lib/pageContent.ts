import "server-only";

/**
 * Content bindings for an authorable page. `insuranceJourneyPath` is the AEM
 * Content Fragment queried for the page; `xfPath` is an optional Experience
 * Fragment rendered into the page.
 */
export type PageContentConfig = {
  insuranceJourneyPath: string;
  xfPath?: string;
};

/**
 * Maps an AEM Sites page path (the URL the Universal Editor loads) to the AEM
 * content that should render there. Add an entry per authorable page.
 */
const PAGE_CONTENT: Record<string, PageContentConfig> = {
  "/content/wknd/language-masters/en/caravan": {
    insuranceJourneyPath:
      "/content/dam/wknd-shared/caravan/caravan-insurance-journey",
    xfPath:
      "/content/experience-fragments/wknd/language-masters/en/featured/camping-western-australia/master",
  },
};

/**
 * Content served at the site root (`/`).
 */
export const DEFAULT_PAGE_CONTENT: PageContentConfig =
  PAGE_CONTENT["/content/wknd/language-masters/en/caravan"];

export function resolvePageContent(pagePath: string): PageContentConfig | null {
  return PAGE_CONTENT[pagePath] ?? null;
}

export function getPageContentPaths(): string[] {
  return Object.keys(PAGE_CONTENT);
}
