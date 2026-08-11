"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CaravanContentResponseData,
  InsuranceJourneyModelByPathData,
  InsuranceJourneyModel,
} from "@/app/types/ContentTypes";
import { mapJsonRichText } from "./utils/renderRichText";
import { useUniversalEditorMode } from "./lib/useUniversalEditorMode";
import { INSURANCE_JOURNEY_STEP_MODEL_IDS } from "./lib/universalEditorModels";

type CaravanFormClientProps = {
  caravanData: CaravanContentResponseData | null;
  htmlContent?: string;
  xfPath?: string;
  insuranceJourneyData?: InsuranceJourneyModelByPathData | null;
  isEditing?: boolean;
};

const defaultInsuranceJourneyResource =
  "urn:aemconnection:/content/dam/wknd-shared/caravan/caravan-insurance-journey/jcr:content/data/master";

export default function CaravanFormClient({
  caravanData,
  htmlContent,
  xfPath,
  insuranceJourneyData,
  isEditing: isEditingProp = false,
}: CaravanFormClientProps) {
  const isEditing = useUniversalEditorMode(isEditingProp);
  const stepPreviewRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (!isEditing) {
      return 1;
    }

    if (typeof window === "undefined") {
      return 1;
    }

    const stepParam = new URLSearchParams(window.location.search).get("step");
    const parsedStep = Number.parseInt(stepParam ?? "", 10);
    return Number.isNaN(parsedStep) ? 1 : Math.max(1, Math.min(parsedStep, 4));
  });
  // Author-only overview that renders every step in an accordion so all
  // authorable fields are reachable at once.
  const [showOverview, setShowOverview] = useState<boolean>(true);
  // Which accordion panel is expanded in the author overview.
  const [expandedStepId, setExpandedStepId] = useState<number | null>(
    () => activeStep,
  );
  const [xfHtmlContent, setXfHtmlContent] = useState<string | undefined>(
    htmlContent,
  );
  const [isXfLoading, setIsXfLoading] = useState(
    Boolean(xfPath && !htmlContent),
  );
  const insuranceJourneyContent = insuranceJourneyData
    ?.insuranceJourneyModelByPath?.item as InsuranceJourneyModel;
  const insuranceJourneyResource = insuranceJourneyContent?._path
    ? `urn:aemconnection:${insuranceJourneyContent._path}/jcr:content/data/master`
    : defaultInsuranceJourneyResource;

  useEffect(() => {
    if (!xfPath || htmlContent) {
      setIsXfLoading(false);
      return;
    }

    let ignore = false;
    const requestedXfPath = xfPath;
    setIsXfLoading(true);

    async function loadExperienceFragment() {
      try {
        const response = await fetch(
          `/api/experience-fragment?path=${encodeURIComponent(requestedXfPath)}`,
        );

        if (!response.ok) {
          throw new Error(`XF API failed: ${response.status}`);
        }

        const html = await response.text();
        if (!ignore) {
          setXfHtmlContent(html);
        }
      } catch (error) {
        console.error("Error fetching XF content from API:", error);
      } finally {
        if (!ignore) {
          setIsXfLoading(false);
        }
      }
    }

    loadExperienceFragment();

    return () => {
      ignore = true;
    };
  }, [xfPath, htmlContent, isEditing]);

  const steps = [
    {
      id: 1,
      headingProp: "step1Heading",
      searchCtaProp: "step1SearchCta",
      continueCtaProp: "step1ContinueCta",
      authorHint:
        "Author note: click the step card to review the Heading, Search CTA, and Continue CTA descriptions in the properties rail. Clicking the heading or CTA edits that field inline and will not show the rail description.",
      path: insuranceJourneyContent?.step1._path,
      heading: insuranceJourneyContent?.step1.step1Heading,
      searchCta: insuranceJourneyContent?.step1.step1SearchCta,
      continueCta: insuranceJourneyContent?.step1.step1ContinueCta,
    },
    {
      id: 2,
      headingProp: "step2Heading",
      continueCtaProp: "step2ContinueCta",
      authorHint:
        "Author note: click the step card to review the Heading, Back CTA, and Continue CTA descriptions in the properties rail. Clicking the heading or CTA edits that field inline and will not show the rail description.",
      path: insuranceJourneyContent?.step2._path,
      heading: insuranceJourneyContent?.step2.step2Heading,
      continueCta: insuranceJourneyContent?.step2.step2ContinueCta,
    },
    {
      id: 3,
      headingProp: "step3Heading",
      continueCtaProp: "step3ContinueCta",
      authorHint:
        "Author note: click the step card to review the Heading, Back CTA, Continue CTA, and Completion Message descriptions in the properties rail. Clicking the heading or CTA edits that field inline and will not show the rail description.",
      path: insuranceJourneyContent?.step3._path,
      heading: insuranceJourneyContent?.step3.step3Heading,
      continueCta: insuranceJourneyContent?.step3.step3ContinueCta,
    },
  ] as const;

  // Author overview is only meaningful in edit mode.
  const showAll = isEditing && showOverview;

  useEffect(() => {
    if (!isEditing || showOverview || typeof window === "undefined") {
      return;
    }

    const scrollTarget =
      activeStep <= 3
        ? stepPreviewRefs.current[activeStep]
        : document.querySelector<HTMLElement>('[data-step="success"]');

    if (!scrollTarget) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollTarget.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  }, [activeStep, isEditing, showOverview]);

  const previewStep = useCallback((stepId: number) => {
    const clampedStep = Math.max(1, Math.min(stepId, 4));
    setActiveStep(clampedStep);
    setShowOverview(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(clampedStep));
      window.history.replaceState({}, "", url);
    }
  }, []);

  // Expand a single step inline in the author overview so its fields can be
  // edited directly on the canvas or via the properties rail.
  const editStep = useCallback((stepId: number) => {
    const clampedStep = Math.max(1, Math.min(stepId, 4));
    setShowOverview(true);
    setExpandedStepId(clampedStep);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const target =
          clampedStep <= 3
            ? stepPreviewRefs.current[clampedStep]
            : document.querySelector<HTMLElement>('[data-step="success"]');
        target?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  }, []);

  const step3Resource = steps[2]?.path
    ? `urn:aemconnection:${steps[2].path}/jcr:content/data/master`
    : insuranceJourneyResource;

  return (
    <>
      {/* Author controls live OUTSIDE the instrumented container: the Universal
          Editor paints a selection overlay over every editable element's rect,
          which would otherwise swallow clicks on any in-canvas button in edit
          mode. Kept here they stay genuinely clickable. */}
      {isEditing ? (
        <nav className="caravan-author-panel" aria-label="Step navigator">
          {showOverview ? (
            <>
              <p className="caravan-author-panel-title">Step navigator</p>
              <p className="caravan-author-panel-description">
                Jump to a step, open it in the accordion, or preview it in the
                runtime view.
              </p>
              <ul className="caravan-author-panel-list">
                {steps.map((step) => (
                  <li key={step.id} className="caravan-author-panel-row">
                    <span className="caravan-author-panel-label">
                      {`Step ${step.id}`}
                      {step.heading ? ` \u2014 ${step.heading}` : ""}
                    </span>
                    <span className="caravan-author-panel-actions">
                      <button
                        type="button"
                        className="caravan-author-edit-btn"
                        onClick={() => editStep(step.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="caravan-author-preview-btn"
                        onClick={() => previewStep(step.id)}
                      >
                        Preview this step
                      </button>
                    </span>
                  </li>
                ))}
                <li className="caravan-author-panel-row">
                  <span className="caravan-author-panel-label">
                    Completion message
                  </span>
                  <span className="caravan-author-panel-actions">
                    <button
                      type="button"
                      className="caravan-author-edit-btn"
                      onClick={() => editStep(4)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="caravan-author-preview-btn"
                      onClick={() => previewStep(4)}
                    >
                      Preview this step
                    </button>
                  </span>
                </li>
              </ul>
            </>
          ) : (
            <div className="caravan-author-panel-single">
              <button
                type="button"
                className="caravan-author-back-btn"
                onClick={() => setShowOverview(true)}
              >
                ← Back to all steps
              </button>
              <span className="caravan-author-panel-label">
                {activeStep <= 3
                  ? `Editing step ${activeStep}`
                  : "Editing completion message"}
              </span>
            </div>
          )}
        </nav>
      ) : null}
      <div
        className="caravan-form-steps"
        data-aue-resource={insuranceJourneyResource}
        data-aue-type="container"
        data-aue-label="Insurance Journey"
      >
        {steps.map((step) => {
          const isVisible = activeStep === step.id;
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
              ref={(element) => {
                stepPreviewRefs.current[step.id] = element;
              }}
              data-step={step.id}
              data-aue-resource={insuranceJourneyStepResource}
              data-aue-type="component"
              data-aue-label={`Step ${step.id}`}
              data-aue-model={INSURANCE_JOURNEY_STEP_MODEL_IDS[step.id]}
              style={{ scrollMarginTop: "128px" }}
            >
              {isEditing ? (
                <p className="caravan-author-hint" role="note">
                  {step.authorHint}
                </p>
              ) : null}
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
                    <span>Year</span>
                    <select defaultValue="">
                      <option value="" disabled>
                        Select year
                      </option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </label>

                  <label className="caravan-form-field">
                    <span>Make</span>
                    <select defaultValue="">
                      <option value="" disabled>
                        Select make
                      </option>
                      <option value="swift">Swift</option>
                      <option value="bailey">Bailey</option>
                      <option value="coachman">Coachman</option>
                    </select>
                  </label>

                  <label className="caravan-form-field">
                    <span>Model</span>
                    <select defaultValue="">
                      <option value="" disabled>
                        Select model
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
                      <p className="caravan-confirm-subtitle">Family Castle</p>
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
                        <path d="M297 127h18l8-8h11" className="caravan-line" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      className="caravan-link-button"
                      onClick={() => setActiveStep(1)}
                    >
                      Change caravan
                    </button>
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
                          To the <a href="#">terms and conditions of use</a> and{" "}
                          <a href="#">RACV Privacy Charter</a>.
                        </div>
                      </li>
                    </ul>
                    <p className="caravan-agreement-note">
                      Your answers help determine if insurance can be offered,
                      and on what terms. If you don&apos;t agree to these terms,
                      call us to discuss your options.
                    </p>
                  </div>
                </>
              ) : null}
              {step.id === 3 ? (
                <div className="caravan-usage-flow">
                  <section className="caravan-usage-panel">
                    <div className="caravan-usage-section-header">
                      <p className="caravan-usage-question">
                        How do you mostly use your caravan?
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
                          <strong>Residential</strong>
                          <small>I live in it</small>
                        </span>
                      </label>

                      <label className="caravan-choice-card">
                        <input type="radio" name="usageType" />
                        <span
                          className="caravan-choice-indicator"
                          aria-hidden="true"
                        />
                        <span className="caravan-choice-copy">
                          <strong>Recreational</strong>
                          <small>I use it for holidays and weekends</small>
                        </span>
                      </label>

                      <label className="caravan-choice-card caravan-choice-card-selected">
                        <input type="radio" name="usageType" defaultChecked />
                        <span
                          className="caravan-choice-indicator"
                          aria-hidden="true"
                        />
                        <span className="caravan-choice-copy">
                          <strong>Rental accommodation</strong>
                          <small>I live in it and rent it out</small>
                        </span>
                      </label>

                      <label className="caravan-choice-card">
                        <input type="radio" name="usageType" />
                        <span
                          className="caravan-choice-indicator"
                          aria-hidden="true"
                        />
                        <span className="caravan-choice-copy">
                          <strong>Business use</strong>
                        </span>
                      </label>
                    </div>

                    <div className="caravan-usage-section-header">
                      <p className="caravan-usage-question">
                        How do you rent it out?
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
                          <strong>Privately</strong>
                        </span>
                      </label>

                      <label className="caravan-choice-card caravan-choice-card-selected">
                        <input type="radio" name="rentOutType" defaultChecked />
                        <span
                          className="caravan-choice-indicator"
                          aria-hidden="true"
                        />
                        <span className="caravan-choice-copy">
                          <strong>On an app or website</strong>
                          <small>Like Camplify or Outdoorsy</small>
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
                        <input type="radio" name="moveCaravan" defaultChecked />
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
                        Pay less for your cover by telling us when you park your
                        caravan here - this is called a lay up period.
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
                    <button
                      type="button"
                      className="caravan-step-back"
                      onClick={() => setActiveStep(2)}
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : null}
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
            </div>
          );

          if (showAll) {
            return (
              <details
                key={step.id}
                className="caravan-author-step"
                open={expandedStepId === step.id}
                onToggle={(event) => {
                  const isOpen = (event.target as HTMLDetailsElement).open;
                  setExpandedStepId((current) =>
                    isOpen ? step.id : current === step.id ? null : current,
                  );
                }}
              >
                <summary className="caravan-author-step-summary">
                  <span className="caravan-author-step-title">
                    {`Step ${step.id}`}
                    {step.heading ? ` \u2014 ${step.heading}` : ""}
                  </span>
                </summary>
                {stepBlock}
              </details>
            );
          }

          return stepBlock;
        })}

        {showAll ? (
          <details
            className="caravan-author-step"
            open={expandedStepId === 4}
            onToggle={(event) => {
              const isOpen = (event.target as HTMLDetailsElement).open;
              setExpandedStepId((current) =>
                isOpen ? 4 : current === 4 ? null : current,
              );
            }}
          >
            <summary className="caravan-author-step-summary">
              <span className="caravan-author-step-title">
                Completion message
              </span>
            </summary>
            <div
              className="caravan-form-step caravan-form-success"
              data-step="success"
              style={{ scrollMarginTop: "128px" }}
            >
              <div
                data-aue-resource={step3Resource}
                data-aue-prop="completionMessage"
                data-aue-type="richtext"
                data-aue-filter="cf"
              >
                {mapJsonRichText(
                  insuranceJourneyContent?.step3.completionMessage[0]?.json,
                ) ?? "Congratulations! You have done it!"}
              </div>
            </div>
          </details>
        ) : null}

        {!showAll && activeStep === 4 ? (
          <div
            className="caravan-form-step caravan-form-success"
            data-step="success"
            style={{ scrollMarginTop: "128px" }}
          >
            <div
              data-aue-resource={step3Resource}
              data-aue-prop="completionMessage"
              data-aue-type="richtext"
              data-aue-filter="cf"
            >
              {/* {mapJsonRichText(caravanContent.finalstepmessage[0]?.json) ??
              "Congratulations! You have done it!"} */}
              {mapJsonRichText(
                insuranceJourneyContent.step3.completionMessage[0]?.json,
              ) ?? "Congratulations! You have done it!"}
            </div>
          </div>
        ) : null}

        {!showAll && (isXfLoading || xfHtmlContent) ? (
          <section className="caravan-form-step">
            <h3>Experience Fragmet content</h3>
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
              <div dangerouslySetInnerHTML={{ __html: xfHtmlContent! }} />
            )}
          </section>
        ) : null}
      </div>
    </>
  );
}
