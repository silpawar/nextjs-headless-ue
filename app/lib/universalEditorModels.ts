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
        component: "aem-content",
        label: "Bottom Experience Fragment - Content Picker",
        name: "bottomXfContentPicker",
        multi: true,
        valueType: "string",
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
        label: "Continue CTA",
        name: "step1ContinueCta",
        valueType: "string",
        description:
          "Label for the continue button that moves the author preview to step 2.",
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
      {
        component: "tab",
        name: "caravanUse",
        label: "Caravan Use",
      },
      {
        component: "text",
        label: "How Do You Use Your Caravan Label",
        name: "howDoYouUseYourCaravanLabel",
        valueType: "string",
      },
      {
        component: "aem-content-fragment",
        label: "Residential Checkbox",
        name: "residentialCheckbox",
        valueType: "string",
        validation: {
          rootPath: "/content/dam/wknd-shared/caravan",
        },
      },
      {
        component: "text",
        label: "Recreational Checkbox Label",
        name: "recreationalCheckboxLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "Recreational Checkbox Bottom Text",
        name: "recreationalCheckboxBottomText",
        valueType: "string",
      },
      {
        component: "text",
        label: "Rental Accommodation Checkbox Label",
        name: "rentalAccomodationCheckboxLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "Rental Accommodation Checkbox Bottom Text",
        name: "rentalAccomodationCheckboxBottomText",
        valueType: "string",
      },
      {
        component: "text",
        label: "Business Use Checkbox Label",
        name: "businessUseCheckboxLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "Business Use Checkbox Bottom Text",
        name: "businessUseCheckboxBottomText",
        valueType: "string",
      },
      {
        component: "text",
        label: "How Do You Rent Out Your Caravan Label",
        name: "howDoYouRentOutYourCaravanLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "Private Checkbox Label",
        name: "privateCheckboxLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "Private Checkbox Bottom Text",
        name: "privateCheckboxBottomText",
        valueType: "string",
      },
      {
        component: "text",
        label: "App/Website Checkbox Label",
        name: "appWebCheckboxLabel",
        valueType: "string",
      },
      {
        component: "text",
        label: "App/Website Checkbox Bottom Text",
        name: "appWebCheckboxBottomText",
        valueType: "string",
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
