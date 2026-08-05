import { queryAEM } from "./lib/aem-client";
import { isUniversalEditorRequest } from "./lib/universalEditor";
import CaravanFormClient from "@/app/CaravanFormClient";
import type {
  CaravanContentResponseData,
  InsuranceJourneyModelByPathData,
} from "@/app/types/ContentTypes";
import "./page.css";

// Add dynamic rendering to test graphQL call is being made on page load
export const dynamic = "force-dynamic";

export default async function Home() {
  let caravanData: CaravanContentResponseData | null = null;
  let insuranceJourneyData: InsuranceJourneyModelByPathData | null = null;

  // Server-side detection of the AEM Universal Editor (author) context.
  // If true, we are in author mode and make a graphQL call to the AEM author instance (with
  // authorization) so in-progress / unpublished content is reflected.
  const isUniversalEditor = await isUniversalEditorRequest();

  try {
    console.log(
      `Fetching data from AEM GraphQL (${isUniversalEditor ? "author" : "publish"})...`,
    );
    // caravanData = await queryAEM<CaravanContentResponseData>(
    //   "insurance-journey-content",
    //   { path: "/content/dam/wknd-shared/caravan/caravan-insurance-journey" },
    // );
    insuranceJourneyData = await queryAEM<InsuranceJourneyModelByPathData>(
      "insurance-journey-content",
      { path: "/content/dam/wknd-shared/caravan/caravan-insurance-journey" },
      { authorMode: isUniversalEditor },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <CaravanFormClient
          caravanData={caravanData}
          insuranceJourneyData={insuranceJourneyData}
          isEditing={isUniversalEditor}
          xfPath="/content/experience-fragments/wknd/language-masters/en/featured/camping-western-australia/master"
        />
      </main>
    </div>
  );
}
