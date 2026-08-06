export const INSURANCE_JOURNEY_MODEL_DEFINITION = [
  {
    id: "insurance-journey-step-1",
    fields: [
      {
        component: "text",
        label: "Heading",
        name: "step1Heading",
        valueType: "string",
      },
      {
        component: "text",
        label: "Search CTA",
        name: "step1SearchCta",
        valueType: "string",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step1ContinueCta",
        valueType: "string",
      },
    ],
  },
  {
    id: "insurance-journey-step-2",
    fields: [
      {
        component: "text",
        label: "Heading",
        name: "step2Heading",
        valueType: "string",
      },
      {
        component: "text",
        label: "Back CTA",
        name: "step2BackCta",
        valueType: "string",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step2ContinueCta",
        valueType: "string",
      },
    ],
  },
  {
    id: "insurance-journey-step-3",
    fields: [
      {
        component: "text",
        label: "Heading",
        name: "step3Heading",
        valueType: "string",
      },
      {
        component: "text",
        label: "Back CTA",
        name: "step3BackCta",
        valueType: "string",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step3ContinueCta",
        valueType: "string",
      },
      {
        component: "richtext",
        label: "Completion Message",
        name: "completionMessage",
        valueType: "string",
      },
    ],
  },
] as const;

export const INSURANCE_JOURNEY_STEP_MODEL_IDS = {
  1: "insurance-journey-step-1",
  2: "insurance-journey-step-2",
  3: "insurance-journey-step-3",
} as const;
