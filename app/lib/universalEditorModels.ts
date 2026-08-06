export const INSURANCE_JOURNEY_MODEL_ID = "insurance-journey-steps";

export const INSURANCE_JOURNEY_MODEL_DEFINITION = [
  {
    id: INSURANCE_JOURNEY_MODEL_ID,
    fields: [
      {
        component: "container",
        label: "Step 1",
        name: "step1",
        valueType: "string",
        collapsible: true,
        fields: [
          {
            component: "text",
            label: "Heading",
            name: "step1/step1Heading",
            valueType: "string",
          },
          {
            component: "text",
            label: "Search CTA",
            name: "step1/step1SearchCta",
            valueType: "string",
          },
          {
            component: "text",
            label: "Continue CTA",
            name: "step1/step1ContinueCta",
            valueType: "string",
          },
        ],
      },
      {
        component: "container",
        label: "Step 2",
        name: "step2",
        valueType: "string",
        collapsible: true,
        fields: [
          {
            component: "text",
            label: "Heading",
            name: "step2/step2Heading",
            valueType: "string",
          },
          {
            component: "text",
            label: "Back CTA",
            name: "step2/step2BackCta",
            valueType: "string",
          },
          {
            component: "text",
            label: "Continue CTA",
            name: "step2/step2ContinueCta",
            valueType: "string",
          },
        ],
      },
      {
        component: "container",
        label: "Step 3",
        name: "step3",
        valueType: "string",
        collapsible: true,
        fields: [
          {
            component: "text",
            label: "Heading",
            name: "step3/step3Heading",
            valueType: "string",
          },
          {
            component: "text",
            label: "Back CTA",
            name: "step3/step3BackCta",
            valueType: "string",
          },
          {
            component: "text",
            label: "Continue CTA",
            name: "step3/step3ContinueCta",
            valueType: "string",
          },
          {
            component: "richtext",
            label: "Completion Message",
            name: "step3/completionMessage",
            valueType: "string",
          },
        ],
      },
    ],
  },
] as const;
