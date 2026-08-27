"use client";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type {
  CaravanContentResponseData,
  InsuranceJourneyModelByPathData,
  InsuranceJourneyModel,
} from "@/app/types/ContentTypes";
import { mapJsonRichText } from "./utils/renderRichText";
import { useUniversalEditorMode } from "./lib/useUniversalEditorMode";
import {
  INSURANCE_JOURNEY_PARENT_MODEL_ID,
  INSURANCE_JOURNEY_STEP_MODEL_IDS,
} from "./lib/universalEditorModels";

type CaravanFormClientProps = {
  caravanData: CaravanContentResponseData | null;
  htmlContent?: string;
  xfPath?: string;
  insuranceJourneyData?: InsuranceJourneyModelByPathData | null;
  // isEditing?: boolean;
  authorStep?: number;
};

const defaultInsuranceJourneyResource =
  "urn:aemconnection:/content/dam/wknd-shared/caravan/caravan-insurance-journey/jcr:content/data/master";

export default function CaravanFormClient({
  htmlContent,
  xfPath,
  insuranceJourneyData,
  // isEditing: isEditingProp = false,
  authorStep,
}: CaravanFormClientProps) {
  // const universalEditorMode = useUniversalEditorMode(isEditingProp);
  const universalEditorMode = useUniversalEditorMode();
  console.log("Universal Editor mode:", universalEditorMode);
  const isUniversalEditor = universalEditorMode !== "publish";
  const isAuthorEditing = universalEditorMode === "edit";
  const shellClassName = isUniversalEditor
    ? "caravan-ue-shell flex flex-col items-center justify-start font-sans dark:bg-black"
    : "flex flex-col flex-1 items-center justify-center font-sans dark:bg-black";
  const mainClassName = isUniversalEditor
    ? "caravan-ue-main flex w-full max-w-3xl flex-col items-center justify-start px-6 py-8 bg-white dark:bg-black sm:items-stretch sm:px-8 lg:px-10"
    : "flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start";
  const navRef = useRef<HTMLElement | null>(null);
  const [authorScrollOffset, setAuthorScrollOffset] = useState(160);
  const [expandedAuthorStepId, setExpandedAuthorStepId] = useState<
    number | null
  >(null);
  // const [activeStep, setActiveStep] = useState<number>(() => {
  //   if (isEditingProp && authorStep !== undefined) {
  //     return authorStep;
  //   }
  //
  //   if (!isEditingProp) {
  //     return 1;
  //   }
  //
  //   if (typeof window === "undefined") {
  //     return 1;
  //   }
  //
  //   const stepParam = new URLSearchParams(window.location.search).get("step");
  //   const parsedStep = Number.parseInt(stepParam ?? "", 10);
  //   return Number.isNaN(parsedStep) ? 1 : Math.max(1, Math.min(parsedStep, 4));
  // });
  const [activeStep, setActiveStep] = useState(authorStep ?? 1);
  const [fetchedXfContent, setFetchedXfContent] = useState<string[]>();
  const insuranceJourneyContent = insuranceJourneyData
    ?.insuranceJourneyModelByPath?.item as InsuranceJourneyModel;
  const insuranceJourneyResource = insuranceJourneyContent?._path
    ? `urn:aemconnection:${insuranceJourneyContent._path}/jcr:content/data/master`
    : defaultInsuranceJourneyResource;
  const configuredBottomXfPath = insuranceJourneyContent?.bottomXfPath?._path;
  const bottomXfVariation = insuranceJourneyContent?.bottomXfVariation;
  const bottomXfPath =
    configuredBottomXfPath && bottomXfVariation
      ? `${configuredBottomXfPath}/${bottomXfVariation}`
      : (configuredBottomXfPath ?? xfPath);
  const bottomXfPaths =
    insuranceJourneyContent?.bottomXfContentPicker
      ?.map(({ _path }) => _path)
      .filter(Boolean) ?? (bottomXfPath ? [bottomXfPath] : []);
  const bottomXfPathsKey = JSON.stringify(bottomXfPaths);
  const hasBottomXfs = bottomXfPaths.length > 0;
  const xfHtmlContent = htmlContent ? [htmlContent] : fetchedXfContent;
  const isXfLoading = Boolean(
    hasBottomXfs && !htmlContent && !fetchedXfContent,
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle("caravan-ue-document", isUniversalEditor);
    html.classList.toggle("h-full", !isUniversalEditor);
    body.classList.toggle("caravan-ue-body", isUniversalEditor);

    return (): void => {
      html.classList.remove("caravan-ue-document");
      html.classList.add("h-full");
      body.classList.remove("caravan-ue-body");
    };
  }, [isUniversalEditor]);

  const handlePreviewStepSelect = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextStep = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(nextStep)) {
      return;
    }

    setActiveStep(nextStep);
  };

  useEffect(() => {
    if (!hasBottomXfs || htmlContent) {
      return;
    }

    let ignore = false;
    const requestedXfPaths = JSON.parse(bottomXfPathsKey) as string[];

    async function loadExperienceFragment() {
      try {
        const html = await Promise.all(
          requestedXfPaths.map(async (path) => {
            const response = await fetch(
              `/api/experience-fragment?path=${encodeURIComponent(path)}`,
            );

            if (!response.ok) {
              throw new Error(`XF API failed: ${response.status}`);
            }

            return response.text();
          }),
        );
        if (!ignore) {
          setFetchedXfContent(html);
        }
      } catch (error) {
        console.error("Error fetching XF content from API:", error);
        if (!ignore) {
          setFetchedXfContent([]);
        }
      }
    }

    loadExperienceFragment();

    return () => {
      ignore = true;
    };
  }, [bottomXfPathsKey, hasBottomXfs, htmlContent]);

  useEffect(() => {
    if (!isAuthorEditing || typeof window === "undefined") {
      return;
    }

    const updateAuthorScrollOffset = () => {
      const navElement = navRef.current;
      if (!navElement) {
        return;
      }

      const navHeight = navElement.getBoundingClientRect().height;
      const stickyTop = Number.parseFloat(
        window.getComputedStyle(navElement).top,
      );
      const resolvedStickyTop = Number.isNaN(stickyTop) ? 0 : stickyTop;

      setAuthorScrollOffset(Math.ceil(navHeight + resolvedStickyTop + 16));
    };

    updateAuthorScrollOffset();

    const navElement = navRef.current;
    const resizeObserver =
      navElement && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateAuthorScrollOffset)
        : null;

    if (resizeObserver && navElement) {
      resizeObserver.observe(navElement);
    }
    window.addEventListener("resize", updateAuthorScrollOffset);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateAuthorScrollOffset);
    };
  }, [isAuthorEditing]);

  useEffect(() => {
    if (!isAuthorEditing) {
      return;
    }

    const expandSelectedStep = (event: Event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const stepElement = event.target.closest<HTMLElement>("[data-step]");
      const stepId = Number.parseInt(stepElement?.dataset.step ?? "", 10);
      if (!Number.isNaN(stepId)) {
        setExpandedAuthorStepId(stepId);
      }
    };

    document.addEventListener("aue:ui-select", expandSelectedStep);

    return () => {
      document.removeEventListener("aue:ui-select", expandSelectedStep);
    };
  }, [isAuthorEditing]);

  const steps = [
    {
      id: 1,
      headingProp: "step1Heading",
      searchCtaProp: "step1SearchCta",
      continueCtaProp: "step1ContinueCta",
      path: insuranceJourneyContent?.step1._path,
      heading: insuranceJourneyContent?.step1.step1Heading,
      searchCta: insuranceJourneyContent?.step1.step1SearchCta,
      continueCta: insuranceJourneyContent?.step1.step1ContinueCta,
    },
    {
      id: 2,
      headingProp: "step2Heading",
      continueCtaProp: "step2ContinueCta",
      path: insuranceJourneyContent?.step2._path,
      heading: insuranceJourneyContent?.step2.step2Heading,
      continueCta: insuranceJourneyContent?.step2.step2ContinueCta,
    },
    {
      id: 3,
      headingProp: "step3Heading",
      continueCtaProp: "step3ContinueCta",
      path: insuranceJourneyContent?.step3._path,
      heading: insuranceJourneyContent?.step3.step3Heading,
      continueCta: insuranceJourneyContent?.step3.step3ContinueCta,
    },
  ] as const;

  const showAll = isAuthorEditing && authorStep === undefined;
  const visibleStep =
    isAuthorEditing && authorStep !== undefined ? authorStep : activeStep;
  const totalSteps = steps.length;
  const authorScrollTargetStyle: CSSProperties | undefined = isAuthorEditing
    ? {
        ["--caravan-author-scroll-offset" as string]: `${authorScrollOffset}px`,
      }
    : undefined;

  const step4Resource = insuranceJourneyContent?.step4._path
    ? `urn:aemconnection:${insuranceJourneyContent.step4._path}/jcr:content/data/master`
    : insuranceJourneyResource;

  return (
    <div className={shellClassName}>
      <main className={mainClassName}>
        {universalEditorMode === "preview" ? (
          <nav
            ref={navRef}
            className="caravan-author-panel"
            aria-label="Choose preview step"
          >
            <p className="caravan-author-panel-title">Journey preview</p>
            <p className="caravan-author-panel-description">
              Preview the live single-step journey by choosing which step should
              be active in the canvas.
            </p>
            <label className="caravan-author-select-field">
              <span className="caravan-author-select-label">Active step</span>
              <select
                className="caravan-author-select"
                value={String(activeStep)}
                onChange={handlePreviewStepSelect}
              >
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {`Step ${step.id}: ${step.heading ?? `Step ${step.id}`}`}
                  </option>
                ))}
                <option value="4">Confirmation message</option>
              </select>
            </label>
          </nav>
        ) : null}
        <div
          className="caravan-form-steps"
          data-aue-resource={insuranceJourneyResource}
          data-aue-type="container"
          data-aue-label="Insurance Journey"
          data-aue-model={INSURANCE_JOURNEY_PARENT_MODEL_ID}
        >
          {steps.map((step) => {
            const isVisible = visibleStep === step.id;
            const insuranceJourneyStepResource = step.path
              ? `urn:aemconnection:${step.path}/jcr:content/data/master`
              : insuranceJourneyResource;

            if (!showAll && !isVisible) {
              return null;
            }

            const stepBlock = (
              <div
                key={step.id}
                className="caravan-form-step"
                style={authorScrollTargetStyle}
                data-step={showAll ? undefined : step.id}
                data-aue-resource={
                  showAll ? undefined : insuranceJourneyStepResource
                }
                data-aue-type={showAll ? undefined : "component"}
                data-aue-label={showAll ? undefined : `Step ${step.id}`}
                data-aue-model={
                  showAll
                    ? undefined
                    : INSURANCE_JOURNEY_STEP_MODEL_IDS[step.id]
                }
              >
                <h3
                  data-aue-resource={insuranceJourneyStepResource}
                  data-aue-type="text"
                  data-aue-prop={step.headingProp}
                  data-aue-filter="cf"
                >
                  {step.heading}
                </h3>
                {step.id === 1 ? (
                  <div className="caravan-form-fields">
                    <label className="caravan-form-field">
                      <span
                        data-aue-resource={insuranceJourneyStepResource}
                        data-aue-type="text"
                        data-aue-prop="yearDropdownLabel"
                        data-aue-filter="cf"
                      >
                        {insuranceJourneyContent?.step1.yearDropdownLabel}
                      </span>
                      <select defaultValue="">
                        <option
                          value=""
                          disabled
                          data-aue-resource={insuranceJourneyStepResource}
                          data-aue-type="text"
                          data-aue-prop="yearDropdownPlaceholder"
                          data-aue-filter="cf"
                        >
                          {
                            insuranceJourneyContent?.step1
                              .yearDropdownPlaceholder
                          }
                        </option>
                        {insuranceJourneyContent?.step1?.yearDropdownOptionLabels?.map(
                          (label) => (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label className="caravan-form-field">
                      <span
                        data-aue-resource={insuranceJourneyStepResource}
                        data-aue-type="text"
                        data-aue-prop="makeDropdownLabel"
                        data-aue-filter="cf"
                      >
                        {insuranceJourneyContent?.step1.makeDropdownLabel}
                      </span>
                      <select defaultValue="">
                        <option
                          value=""
                          disabled
                          data-aue-resource={insuranceJourneyStepResource}
                          data-aue-type="text"
                          data-aue-prop="makeDropdownPlaceholder"
                          data-aue-filter="cf"
                        >
                          {
                            insuranceJourneyContent?.step1
                              .makeDropdownPlaceholder
                          }
                        </option>
                        <option value="swift">Swift</option>
                        <option value="bailey">Bailey</option>
                        <option value="coachman">Coachman</option>
                      </select>
                    </label>

                    <label className="caravan-form-field">
                      <span
                        data-aue-resource={insuranceJourneyStepResource}
                        data-aue-type="text"
                        data-aue-prop="modelDropdownLabel"
                        data-aue-filter="cf"
                      >
                        {insuranceJourneyContent?.step1.modelDropdownLabel}
                      </span>
                      <select defaultValue="">
                        <option
                          value=""
                          disabled
                          data-aue-resource={insuranceJourneyStepResource}
                          data-aue-type="text"
                          data-aue-prop="modelDropdownPlaceholder"
                          data-aue-filter="cf"
                        >
                          {
                            insuranceJourneyContent?.step1
                              .modelDropdownPlaceholder
                          }
                        </option>
                        <option value="sprite">Sprite</option>
                        <option value="unicorn">Unicorn</option>
                        <option value="laser">Laser</option>
                      </select>
                    </label>
                  </div>
                ) : null}
                {step.id === 2 ? (
                  <>
                    <div className="caravan-confirm-card">
                      <div className="caravan-confirm-copy">
                        <p className="caravan-confirm-title">
                          2017 CRUSADER CARAVAN
                        </p>
                        <p className="caravan-confirm-subtitle">
                          Family Castle
                        </p>
                      </div>

                      <div
                        className="caravan-confirm-illustration"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 340 190" role="presentation">
                          <ellipse
                            cx="150"
                            cy="164"
                            rx="118"
                            ry="13"
                            className="caravan-shadow"
                          />
                          <path
                            className="caravan-body"
                            d="M28 106c0-43 10-93 58-97 42-3 108 1 143 2 19 1 30 15 37 35l12 35c6 8 18 31 18 43 0 18-14 27-34 29-28 2-168 6-196 0-25-5-38-20-38-47Z"
                          />
                          <rect
                            x="46"
                            y="41"
                            width="90"
                            height="33"
                            rx="8"
                            className="caravan-body"
                          />
                          <rect
                            x="153"
                            y="40"
                            width="38"
                            height="35"
                            rx="8"
                            className="caravan-body"
                          />
                          <rect
                            x="207"
                            y="43"
                            width="44"
                            height="90"
                            rx="6"
                            className="caravan-door"
                          />
                          <line
                            x1="39"
                            y1="99"
                            x2="196"
                            y2="99"
                            className="caravan-line"
                          />
                          <line
                            x1="216"
                            y1="95"
                            x2="224"
                            y2="95"
                            className="caravan-line"
                          />
                          <line
                            x1="260"
                            y1="99"
                            x2="285"
                            y2="99"
                            className="caravan-line"
                          />
                          <circle
                            cx="116"
                            cy="145"
                            r="23"
                            className="caravan-wheel"
                          />
                          <circle
                            cx="178"
                            cy="145"
                            r="23"
                            className="caravan-wheel"
                          />
                          <path
                            d="M297 127h18l8-8h11"
                            className="caravan-line"
                          />
                        </svg>
                      </div>

                      {isAuthorEditing ? (
                        <span className="caravan-link-button caravan-control-static">
                          Change caravan
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="caravan-link-button"
                          onClick={() => setActiveStep(1)}
                        >
                          Change caravan
                        </button>
                      )}
                    </div>

                    <div className="caravan-agreement">
                      <h4>By continuing, you agree</h4>
                      <ul className="caravan-agreement-list">
                        <li>
                          <span className="caravan-bullet" aria-hidden="true">
                            <svg viewBox="0 0 20 20" role="presentation">
                              <circle cx="10" cy="10" r="9" />
                              <path d="m6 10 2.4 2.5L14 7" />
                            </svg>
                          </span>
                          <div>
                            <strong>You will:</strong>
                            <ul>
                              <li>answer all questions honestly</li>
                              <li>
                                review and update any prefilled information, if
                                needed.
                              </li>
                            </ul>
                          </div>
                        </li>
                        <li>
                          <span className="caravan-bullet" aria-hidden="true">
                            <svg viewBox="0 0 20 20" role="presentation">
                              <circle cx="10" cy="10" r="9" />
                              <path d="m6 10 2.4 2.5L14 7" />
                            </svg>
                          </span>
                          <div>
                            To the <a href="#">terms and conditions of use</a>{" "}
                            and <a href="#">RACV Privacy Charter</a>.
                          </div>
                        </li>
                      </ul>
                      <p className="caravan-agreement-note">
                        Your answers help determine if insurance can be offered,
                        and on what terms. If you don&apos;t agree to these
                        terms, call us to discuss your options.
                      </p>
                    </div>
                  </>
                ) : null}
                {step.id === 3 ? (
                  <div className="caravan-usage-flow">
                    <section className="caravan-usage-panel">
                      <div className="caravan-usage-section-header">
                        <p
                          className="caravan-usage-question"
                          data-aue-resource={insuranceJourneyStepResource}
                          data-aue-type="text"
                          data-aue-prop="howDoYouUseYourCaravanLabel"
                          data-aue-filter="cf"
                        >
                          {
                            insuranceJourneyContent?.step3
                              .howDoYouUseYourCaravanLabel
                          }
                        </p>
                        <a href="#" className="caravan-usage-link">
                          Business use explained
                        </a>
                      </div>

                      <div className="caravan-usage-grid caravan-usage-grid-four">
                        <label className="caravan-choice-card">
                          <input type="radio" name="usageType" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={`urn:aemconnection:${insuranceJourneyContent?.step3?.residentialCheckbox?._path}/jcr:content/data/master`}
                              data-aue-type="text"
                              data-aue-prop="label"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  ?.residentialCheckbox?.label
                              }
                            </strong>
                            <small
                              data-aue-resource={`urn:aemconnection:${insuranceJourneyContent?.step3?.residentialCheckbox?._path}/jcr:content/data/master`}
                              data-aue-type="text"
                              data-aue-prop="bottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  ?.residentialCheckbox?.bottomText
                              }
                            </small>
                          </span>
                        </label>

                        <label className="caravan-choice-card">
                          <input type="radio" name="usageType" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="recreationalCheckboxLabel"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .recreationalCheckboxLabel
                              }
                            </strong>
                            <small
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="recreationalCheckboxBottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .recreationalCheckboxBottomText
                              }
                            </small>
                          </span>
                        </label>

                        <label className="caravan-choice-card caravan-choice-card-selected">
                          <input type="radio" name="usageType" defaultChecked />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="rentalAccomodationCheckboxLabel"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .rentalAccomodationCheckboxLabel
                              }
                            </strong>
                            <small
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="rentalAccomodationCheckboxBottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .rentalAccomodationCheckboxBottomText
                              }
                            </small>
                          </span>
                        </label>

                        <label className="caravan-choice-card">
                          <input type="radio" name="usageType" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="businessUseCheckboxLabel"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .businessUseCheckboxLabel
                              }
                            </strong>
                            <small
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="businessUseCheckboxBottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .businessUseCheckboxBottomText
                              }
                            </small>
                          </span>
                        </label>
                      </div>

                      <div className="caravan-usage-section-header">
                        <p
                          className="caravan-usage-question"
                          data-aue-resource={insuranceJourneyStepResource}
                          data-aue-type="text"
                          data-aue-prop="howDoYouRentOutYourCaravanLabel"
                          data-aue-filter="cf"
                        >
                          {
                            insuranceJourneyContent?.step3
                              .howDoYouRentOutYourCaravanLabel
                          }
                        </p>
                      </div>

                      <div className="caravan-usage-grid caravan-usage-grid-two">
                        <label className="caravan-choice-card">
                          <input type="radio" name="rentOutType" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="privateCheckboxLabel"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .privateCheckboxLabel
                              }
                            </strong>
                            <small
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="privateCheckboxBottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .privateCheckboxBottomText
                              }
                            </small>
                          </span>
                        </label>

                        <label className="caravan-choice-card caravan-choice-card-selected">
                          <input
                            type="radio"
                            name="rentOutType"
                            defaultChecked
                          />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="appWebCheckboxLabel"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .appWebCheckboxLabel
                              }
                            </strong>
                            <small
                              data-aue-resource={insuranceJourneyStepResource}
                              data-aue-type="text"
                              data-aue-prop="appWebCheckboxBottomText"
                              data-aue-filter="cf"
                            >
                              {
                                insuranceJourneyContent?.step3
                                  .appWebCheckboxBottomText
                              }
                            </small>
                          </span>
                        </label>
                      </div>

                      <div className="caravan-usage-section-header caravan-usage-section-header-compact">
                        <p className="caravan-usage-question">
                          How much of your caravan&apos;s time is spent rented
                          out?
                        </p>
                      </div>

                      <input
                        className="caravan-percentage-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter a percentage"
                      />
                    </section>

                    <section className="caravan-usage-panel caravan-usage-panel-compact">
                      <div className="caravan-usage-section-header caravan-usage-section-header-compact">
                        <p className="caravan-usage-question">
                          Do you move your caravan from {`{address}`}?
                        </p>
                      </div>

                      <div className="caravan-usage-grid caravan-usage-grid-two">
                        <label className="caravan-choice-card caravan-choice-card-selected">
                          <input
                            type="radio"
                            name="moveCaravan"
                            defaultChecked
                          />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong>Yes</strong>
                            <small>I take my caravan on the road</small>
                          </span>
                        </label>

                        <label className="caravan-choice-card">
                          <input type="radio" name="moveCaravan" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong>No</strong>
                            <small>My caravan is permanently sited</small>
                          </span>
                        </label>
                      </div>
                    </section>

                    <section className="caravan-usage-panel caravan-usage-panel-compact">
                      <div className="caravan-usage-section-header caravan-usage-section-header-compact">
                        <p className="caravan-usage-question">
                          In the next 12 months, will you park your caravan at{" "}
                          {`{address}`} for an extended period of time?
                        </p>
                        <p className="caravan-usage-helper">
                          Pay less for your cover by telling us when you park
                          your caravan here - this is called a lay up period.
                        </p>
                      </div>

                      <div className="caravan-usage-grid caravan-usage-grid-two">
                        <label className="caravan-choice-card">
                          <input type="radio" name="parkExtended" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong>Yes</strong>
                          </span>
                        </label>

                        <label className="caravan-choice-card">
                          <input type="radio" name="parkExtended" />
                          <span
                            className="caravan-choice-indicator"
                            aria-hidden="true"
                          />
                          <span className="caravan-choice-copy">
                            <strong>No</strong>
                          </span>
                        </label>
                      </div>
                    </section>

                    <div className="caravan-step-actions caravan-step-actions-dual">
                      {isAuthorEditing ? (
                        <span className="caravan-step-back caravan-control-static">
                          Back
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="caravan-step-back"
                          onClick={() => setActiveStep(2)}
                        >
                          Back
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
                {isAuthorEditing ? (
                  <span
                    className={
                      step.id === 2
                        ? "caravan-step-cta caravan-step-cta-confirm caravan-control-static"
                        : step.id === 3
                          ? "caravan-step-cta caravan-step-cta-usage caravan-control-static"
                          : "caravan-step-cta caravan-control-static"
                    }
                    data-aue-resource={insuranceJourneyStepResource}
                    data-aue-type="text"
                    data-aue-prop={step.continueCtaProp}
                    data-aue-filter="cf"
                  >
                    {step.continueCta}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={
                      step.id === 2
                        ? "caravan-step-cta caravan-step-cta-confirm"
                        : step.id === 3
                          ? "caravan-step-cta caravan-step-cta-usage"
                          : "caravan-step-cta"
                    }
                    data-aue-resource={insuranceJourneyStepResource}
                    data-aue-type="text"
                    data-aue-prop={step.continueCtaProp}
                    data-aue-filter="cf"
                    onClick={() =>
                      setActiveStep((current) => Math.min(current + 1, 4))
                    }
                  >
                    {step.continueCta}
                  </button>
                )}
              </div>
            );

            if (showAll) {
              return (
                <details
                  key={step.id}
                  id={`caravan-step-${step.id}`}
                  className="caravan-author-step-section"
                  style={authorScrollTargetStyle}
                  data-step={step.id}
                  data-aue-resource={insuranceJourneyStepResource}
                  data-aue-type="component"
                  // data-aue-type="container"
                  data-aue-label={`Step ${step.id}`}
                  data-aue-model={INSURANCE_JOURNEY_STEP_MODEL_IDS[step.id]}
                  open={expandedAuthorStepId === step.id}
                >
                  <summary
                    className="caravan-author-step-label"
                    onClick={(event) => {
                      event.preventDefault();
                      setExpandedAuthorStepId((currentStepId) =>
                        currentStepId === step.id ? null : step.id,
                      );
                    }}
                  >
                    {`Step ${step.id} of ${totalSteps}: ${step.heading ?? `Step ${step.id}`}`}
                  </summary>
                  {stepBlock}
                </details>
              );
            }

            return stepBlock;
          })}

          {showAll ? (
            <section
              id="caravan-step-confirmation"
              className="caravan-author-step-section"
              style={authorScrollTargetStyle}
              data-step="4"
              data-aue-resource={step4Resource}
              data-aue-type="component"
              data-aue-label="Confirmation message"
              data-aue-model={INSURANCE_JOURNEY_STEP_MODEL_IDS[4]}
            >
              <p className="caravan-author-step-label">Confirmation message</p>
              <div
                className="caravan-form-step caravan-form-success"
                data-step="success"
                style={authorScrollTargetStyle}
              >
                <div
                  data-aue-resource={step4Resource}
                  data-aue-prop="confirmationMessage"
                  data-aue-type="richtext"
                  data-aue-filter="cf"
                >
                  {mapJsonRichText(
                    insuranceJourneyContent?.step4.confirmationMessage?.json,
                  ) ?? "Congratulations! You have done it!"}
                </div>
              </div>
            </section>
          ) : null}

          {!showAll && visibleStep === 4 ? (
            <div
              className="caravan-form-step caravan-form-success"
              data-step="success"
              style={authorScrollTargetStyle}
              data-aue-resource={step4Resource}
              data-aue-type="component"
              data-aue-label="Confirmation message"
              data-aue-model={INSURANCE_JOURNEY_STEP_MODEL_IDS[4]}
            >
              <div
                data-aue-resource={step4Resource}
                data-aue-prop="confirmationMessage"
                data-aue-type="richtext"
                data-aue-filter="cf"
              >
                {mapJsonRichText(
                  insuranceJourneyContent?.step4.confirmationMessage?.json,
                ) ?? "Congratulations! You have done it!"}
              </div>
            </div>
          ) : null}

          {isXfLoading || xfHtmlContent?.length ? (
            <section
              className="caravan-form-step"
              data-aue-resource={insuranceJourneyResource}
              data-aue-type="component"
              data-aue-label="Bottom Experience Fragment"
              data-aue-model={INSURANCE_JOURNEY_PARENT_MODEL_ID}
            >
              <h3>Experience Fragment Content</h3>
              {isXfLoading ? (
                <div
                  className="caravan-xf-loader"
                  role="status"
                  aria-live="polite"
                >
                  <span className="caravan-xf-spinner" aria-hidden="true" />
                  Loading experience fragment…
                </div>
              ) : (
                xfHtmlContent?.map((html, index) => (
                  <div
                    key={bottomXfPaths[index] ?? index}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ))
              )}
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
