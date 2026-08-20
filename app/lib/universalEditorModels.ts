export const INSURANCE_JOURNEY_PARENT_MODEL_ID = "insurance-journey-parent";

export const INSURANCE_JOURNEY_MODEL_DEFINITION = [
  {
    id: INSURANCE_JOURNEY_PARENT_MODEL_ID,
    fields: [
      {
        component: "aem-content-fragment",
        label: "Step 1",
        name: "step1",
        valueType: "string",
        validation: {
          rootPath: "/content/dam/wknd-shared/caravan",
        },
      },
      {
        component: "aem-content-fragment",
        label: "Step 2",
        name: "step2",
        valueType: "string",
        validation: {
          rootPath: "/content/dam/wknd-shared/caravan",
        },
      },
      {
        component: "aem-content-fragment",
        label: "Step 3",
        name: "step3",
        valueType: "string",
        validation: {
          rootPath: "/content/dam/wknd-shared/caravan",
        },
      },
      {
        component: "aem-content-fragment",
        label: "Step 4",
        name: "step4",
        valueType: "string",
        validation: {
          rootPath: "/content/dam/wknd-shared/caravan",
        },
      },
      {
        component: "aem-experience-fragment",
        label: "Bottom XF Paths",
        name: "bottomXfPaths",
        valueType: "string[]",
        variationName: "bottomXfVariations",
        validation: {
          rootPath: "/content/experience-fragments/wknd",
        },
      },
    ],
  },
  {
    id: "insurance-journey-step-1",
    fields: [
      {
        component: "text",
        label: "Heading",
        name: "step1Heading",
        valueType: "string",
        description: "The heading for step 1 of the insurance journey.",
        value: "Step 1 Heading (Default)",
      },
      {
        component: "text",
        label: "Search CTA",
        name: "step1SearchCta",
        valueType: "string",
        description:
          "Label for the search button shown after the caravan details are selected.",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step1ContinueCta",
        valueType: "string",
        description:
          "Label for the continue button that moves the author preview to step 2.",
      },
      {
        component: "aem-experience-fragment",
        label: "XF Path",
        name: "xfPath",
        valueType: "string",
        variationName: "xfVariation",
        validation: {
          rootPath: "/content/experience-fragments/wknd",
        },
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
        description:
          "Heading shown when the selected caravan details are confirmed.",
      },
      {
        component: "text",
        label: "Back CTA",
        name: "step2BackCta",
        valueType: "string",
        description: "Label for the button that returns to the previous step.",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step2ContinueCta",
        valueType: "string",
        description: "Label for the button that advances to the next step.",
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
        description: "Heading shown for the final quote details step.",
      },
      {
        component: "text",
        label: "Back CTA",
        name: "step3BackCta",
        valueType: "string",
        description: "Label for the button that returns to step 2.",
      },
      {
        component: "text",
        label: "Continue CTA",
        name: "step3ContinueCta",
        valueType: "string",
        description:
          "Label for the button that submits or completes the journey.",
      },
    ],
  },
  {
    id: "insurance-journey-step-4",
    fields: [
      {
        component: "richtext",
        label: "Confirmation Message",
        name: "confirmationMessage",
        valueType: "string",
        description: "Rich text shown after the journey is completed.",
      },
    ],
  },
] as const;

export const INSURANCE_JOURNEY_STEP_MODEL_IDS = {
  1: "insurance-journey-step-1",
  2: "insurance-journey-step-2",
  3: "insurance-journey-step-3",
  4: "insurance-journey-step-4",
} as const;
