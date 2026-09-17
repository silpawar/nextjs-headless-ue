import { getAemBaseUrl, type AemTarget } from "@/app/lib/aem-client";

export default function AemFetchSourceBanner({
  aemTarget,
}: {
  aemTarget: AemTarget;
}) {
  const baseUrl = getAemBaseUrl(aemTarget);

  return (
    <div
      className="w-full border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
      role="status"
    >
      AEM content source ({aemTarget}):{" "}
      <span className="font-mono font-medium">{baseUrl}</span>
    </div>
  );
}
