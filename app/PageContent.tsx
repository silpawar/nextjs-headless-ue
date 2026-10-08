import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import {
  fetchExperienceFragment,
  queryAEM,
  type AemTarget,
} from "./lib/aem-client";
import { isPerRequestAemTarget } from "./lib/authorRendering";
import { getSiteOrigin, toPreviewSiteUrl } from "./lib/previewSiteUrl";
import { resolveBottomXfPaths } from "./lib/resolveBottomXfPaths";
import CaravanFormClient from "@/app/CaravanFormClient";
import type { InsuranceJourneyModelByPathData } from "@/app/types/ContentTypes";
import type { PageContentConfig } from "./lib/pageContent";
import "./page.css";

export default async function PageContent({
  config,
  authorStep,
  aemTarget = "publish",
  appPathname,
}: {
  config: PageContentConfig;
  authorStep?: number;
  aemTarget?: AemTarget;
  /** Current page path (e.g. /content/wknd/.../caravan). Falls back to x-app-pathname from proxy. */
  appPathname?: string;
}) {
  if (isPerRequestAemTarget(aemTarget)) {
    noStore();
  }

  const requestHeaders = await headers();
  const pathname =
    appPathname ?? requestHeaders.get("x-app-pathname") ?? undefined;
  const siteOrigin = getSiteOrigin(requestHeaders);
  const previewSiteUrl =
    pathname && siteOrigin
      ? toPreviewSiteUrl(siteOrigin, pathname)
      : undefined;

  let insuranceJourneyData: InsuranceJourneyModelByPathData | null = null;
  let serverBottomXfHtml: string[] | undefined;

  try {
    insuranceJourneyData = await queryAEM<InsuranceJourneyModelByPathData>(
      "insurance-journey-content",
      { path: config.insuranceJourneyPath },
      { target: aemTarget },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  if (isPerRequestAemTarget(aemTarget)) {
    const bottomXfPaths = resolveBottomXfPaths(
      insuranceJourneyData,
      config.xfPath,
    );

    if (bottomXfPaths.length > 0) {
      try {
        serverBottomXfHtml = await Promise.all(
          bottomXfPaths.map((path) =>
            fetchExperienceFragment(path, { target: aemTarget }),
          ),
        );
      } catch (error) {
        console.error("Error fetching experience fragments:", error);
        serverBottomXfHtml = [];
      }
    } else {
      serverBottomXfHtml = [];
    }
  }

  return (
    <>
      {previewSiteUrl ? (
        <meta
          name="urn:adobe:aue:config:preview"
          content={previewSiteUrl}
        />
      ) : null}
      <CaravanFormClient
        caravanData={null}
        insuranceJourneyData={insuranceJourneyData}
        authorStep={authorStep}
        xfPath={config.xfPath}
        aemTarget={aemTarget}
        serverBottomXfHtml={serverBottomXfHtml}
      />
    </>
  );
}
