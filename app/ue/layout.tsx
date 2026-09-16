import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isUniversalEditorRequest } from "@/app/lib/universalEditor";

/** UE routes: SSR on every request (no static page shell). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UniversalEditorRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();

  if (
    requestHeaders.get("x-ue-request") !== "1" &&
    !isUniversalEditorRequest(requestHeaders)
  ) {
    notFound();
  }

  return children;
}
