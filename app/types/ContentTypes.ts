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

// Parent container CFM schema
export interface InsuranceJourneyModelByPathData {
  insuranceJourneyModelByPath: InsuranceJourneyModelByPath;
}

export interface InsuranceJourneyModelByPath {
  item: InsuranceJourneyModel;
}

export interface InsuranceJourneyModel {
  step1: Step1Model;
  step2: Step2Model;
  step3: Step3Model;
}

export interface Step1Model {
  _path: string;
  step1Heading: string;
  step1SearchCta: string;
  step1ContinueCta: string;
}

export interface Step2Model {
  _path: string;
  step2Heading: string;
  step2BackCta: string;
  step2ContinueCta: string;
}

export interface Step3Model {
  _path: string;
  step3Heading: string;
  step3BackCta: string;
  step3ContinueCta: string;
  completionMessage: AemRichTextBlock[];
}

export type InsuranceJourneyModelByPathApiResponse =
  AemGraphQlResponse<InsuranceJourneyModelByPathData>;
