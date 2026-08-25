import { queryAEM } from "./lib/aem-client";
// import { isUniversalEditorRequest } from "./lib/universalEditor";
import CaravanFormClient from "@/app/CaravanFormClient";
import type { InsuranceJourneyModelByPathData } from "@/app/types/ContentTypes";
import type { PageContentConfig } from "./lib/pageContent";
import "./page.css";

export default async function PageContent({
  config,
  authorStep,
}: {
  config: PageContentConfig;
  authorStep?: number;
}) {
  let insuranceJourneyData: InsuranceJourneyModelByPathData | null = null;

  // Server-side detection is no longer required. The client determines the
  // Universal Editor mode after hydration.
  // const isUniversalEditor = await isUniversalEditorRequest();

  try {
    insuranceJourneyData = await queryAEM<InsuranceJourneyModelByPathData>(
      "insurance-journey-content",
      { path: config.insuranceJourneyPath },
      // { authorMode: isUniversalEditor },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <CaravanFormClient
      caravanData={null}
      insuranceJourneyData={insuranceJourneyData}
      // isEditing={isUniversalEditor}
      authorStep={authorStep}
      xfPath={config.xfPath}
    />
  );
}
