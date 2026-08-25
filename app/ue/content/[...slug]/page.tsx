import { notFound } from "next/navigation";
import PageContent from "@/app/PageContent";
import { resolveContentRoute } from "@/app/lib/contentRoute";

export const dynamic = "force-dynamic";

export default async function UniversalEditorContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const contentRoute = resolveContentRoute(slug);

  if (!contentRoute) {
    notFound();
  }

  return (
    <PageContent
      config={contentRoute.config}
      authorStep={contentRoute.authorStep}
      aemTarget="preview"
    />
  );
}
