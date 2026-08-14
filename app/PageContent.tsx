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

  const shellClassName = isUniversalEditor
    ? "caravan-ue-shell flex flex-col items-center justify-start font-sans dark:bg-black"
    : "flex flex-col flex-1 items-center justify-center font-sans dark:bg-black";

  const mainClassName = isUniversalEditor
    ? "caravan-ue-main flex w-full max-w-3xl flex-col items-center justify-start px-6 py-8 bg-white dark:bg-black sm:items-stretch sm:px-8 lg:px-10"
    : "flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start";

  return (
    <div className={shellClassName}>
      <main className={mainClassName}>
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
