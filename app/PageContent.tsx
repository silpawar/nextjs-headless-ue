import { queryAEM, type AemTarget } from "./lib/aem-client";
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
  let insuranceJourneyData: InsuranceJourneyModelByPathData | null = null;

  try {
    insuranceJourneyData = await queryAEM<InsuranceJourneyModelByPathData>(
      "insurance-journey-content",
      { path: config.insuranceJourneyPath },
      { target: aemTarget },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <CaravanFormClient
      caravanData={null}
      insuranceJourneyData={insuranceJourneyData}
      authorStep={authorStep}
      xfPath={config.xfPath}
      aemTarget={aemTarget}
    />
  );
}
