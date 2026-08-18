import { notFound } from "next/navigation";
import PageContent from "@/app/PageContent";
import { resolvePageContent } from "@/app/lib/pageContent";

// Detection reads request headers, so this route must render dynamically.
export const dynamic = "force-dynamic";

const STEP_SEGMENT_PATTERN = /^step-([1-4])$/;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pagePath = `/content/${slug.join("/")}`;
  const stepSegment = slug.at(-1);
  const stepMatch = stepSegment?.match(STEP_SEGMENT_PATTERN);
  const authorStep = stepMatch ? Number.parseInt(stepMatch[1], 10) : undefined;
  const config = resolvePageContent(
    authorStep === undefined
      ? pagePath
      : `/content/${slug.slice(0, -1).join("/")}`,
  );

  if (!config) {
    notFound();
  }

  return <PageContent config={config} authorStep={authorStep} />;
}
