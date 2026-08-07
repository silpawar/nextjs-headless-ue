import { queryAEM } from "./lib/aem-client";
import { isUniversalEditorRequest } from "./lib/universalEditor";
import CaravanFormClient from "@/app/CaravanFormClient";
import type { InsuranceJourneyModelByPathData } from "@/app/types/ContentTypes";
import type { PageContentConfig } from "./lib/pageContent";
import "./page.css";

export default async function PageContent({
  config,
}: {
  config: PageContentConfig;
}) {
  let insuranceJourneyData: InsuranceJourneyModelByPathData | null = null;

  // Server-side detection of the AEM Universal Editor (author) context so the
  // GraphQL call targets the author instance and reflects in-progress content.
  const isUniversalEditor = await isUniversalEditorRequest();

  try {
    console.log(
      `Fetching data from AEM GraphQL (${isUniversalEditor ? "author" : "publish"})...`,
    );
    insuranceJourneyData = await queryAEM<InsuranceJourneyModelByPathData>(
      "insurance-journey-content",
      { path: config.insuranceJourneyPath },
      { authorMode: isUniversalEditor },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <CaravanFormClient
          caravanData={null}
          insuranceJourneyData={insuranceJourneyData}
          isEditing={isUniversalEditor}
          xfPath={config.xfPath}
        />
      </main>
    </div>
  );
}
