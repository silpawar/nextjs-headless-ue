import { notFound } from "next/navigation";
import PageContent from "@/app/PageContent";
import { resolvePageContent } from "@/app/lib/pageContent";

// Detection reads request headers, so this route must render dynamically.
export const dynamic = "force-dynamic";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pagePath = `/content/${slug.join("/")}`;
  const config = resolvePageContent(pagePath);

  if (!config) {
    notFound();
  }

  return <PageContent config={config} />;
}
