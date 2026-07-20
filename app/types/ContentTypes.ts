export interface AemGraphQlResponse<T> {
  data: T;
}

export interface AemRichTextNode {
  nodeType: string;
  value?: string;
  content?: AemRichTextNode[];
}

export interface AemRichTextBlock {
  html: string;
  markdown: string;
  plaintext: string;
  json: AemRichTextNode[];
}

export interface CaravanFormModel {
  _path: string;
  _id: string;
  _variation: string;
  step1heading: string;
  step1cta: string;
  step2heading: string;
  step2cta: string;
  step3heading: string;
  step3cta: string;
  finalstepmessage: AemRichTextBlock[];
}

export interface CaravanFormModelByPath {
  item: CaravanFormModel;
}

export interface CaravanFormModelByPathData {
  caravanformmodelByPath: CaravanFormModelByPath;
}

export interface CaravanContentByPathData {
  caravanContentByPath: CaravanFormModelByPath;
}

export interface CaravanContentResponseData {
  caravanContentByPath?: CaravanFormModelByPath;
  caravanformmodelByPath?: CaravanFormModelByPath;
}

export type CaravanFormModelByPathApiResponse =
  AemGraphQlResponse<CaravanFormModelByPathData>;

