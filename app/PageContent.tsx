import { unstable_noStore as noStore } from "next/cache";
import {
  fetchExperienceFragment,
  queryAEM,
  type AemTarget,
} from "./lib/aem-client";
import { isPerRequestAemTarget } from "./lib/authorRendering";
import { resolveBottomXfPaths } from "./lib/resolveBottomXfPaths";
import CaravanFormClient from "@/app/CaravanFormClient";
import type { InsuranceJourneyModelByPathData } from "@/app/types/ContentTypes";
import type { PageContentConfig } from "./lib/pageContent";
import "./page.css";

export default async function PageContent({
  config,
  authorStep,
  aemTarget = "publish",
}: {
  config: PageContentConfig;
  authorStep?: number;
  aemTarget?: AemTarget;
}) {
  if (isPerRequestAemTarget(aemTarget)) {
    noStore();
  }

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
    <CaravanFormClient
      caravanData={null}
      insuranceJourneyData={insuranceJourneyData}
      authorStep={authorStep}
      xfPath={config.xfPath}
      aemTarget={aemTarget}
      serverBottomXfHtml={serverBottomXfHtml}
    />
  );
}
