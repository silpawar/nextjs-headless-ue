import type {
  InsuranceJourneyModel,
  InsuranceJourneyModelByPathData,
} from "@/app/types/ContentTypes";

function uniqueXfPaths(paths: string[]): string[] {
  const seen = new Set<string>();
  return paths.filter((path) => {
    if (seen.has(path)) {
      return false;
    }
    seen.add(path);
    return true;
  });
}

export function resolveBottomXfPaths(
  insuranceJourneyData: InsuranceJourneyModelByPathData | null | undefined,
  fallbackXfPath?: string,
): string[] {
  const insuranceJourneyContent = insuranceJourneyData
    ?.insuranceJourneyModelByPath?.item as InsuranceJourneyModel | undefined;

  if (!insuranceJourneyContent) {
    return fallbackXfPath ? [fallbackXfPath] : [];
  }

  const configuredBottomXfPath = insuranceJourneyContent.bottomXfPath?._path;
  const bottomXfVariation = insuranceJourneyContent.bottomXfVariation;
  const bottomXfPath =
    configuredBottomXfPath && bottomXfVariation
      ? `${configuredBottomXfPath}/${bottomXfVariation}`
      : (configuredBottomXfPath ?? fallbackXfPath);

  return uniqueXfPaths(
    insuranceJourneyContent.bottomXfContentPicker
      ?.map(({ _path }) => _path)
      .filter((path): path is string => Boolean(path)) ??
      (bottomXfPath ? [bottomXfPath] : []),
  );
}
