'use client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useState } from 'react';
import type {
  CaravanContentResponseData,
  CaravanFormModel,
} from '@/app/types/ContentTypes';
import { mapJsonRichText } from './utils/renderRichText';

type CaravanFormClientProps = {
  caravanData: CaravanContentResponseData | null;
};

const caravanResource =
  'urn:aemconnection:/content/dam/wknd-shared/caravan-content/jcr:content/data/master';

const fallbackContent: CaravanFormModel = {
  _path: '/content/dam/wknd-shared/caravan-content',
  _id: 'fallback',
  _variation: 'master',
  step1heading: "Let's find your caravan",
  step1cta: 'Continue to step 2',
  step2heading: "Let's find your caravan - confirm",
  step2cta: 'Continue to step 3',
  step3heading: "Let's set up the basics",
  step3cta: 'Finish',
  finalstepmessage: [],
};

export default function CaravanFormClient({
  caravanData,
}: CaravanFormClientProps) {
  const [activeStep, setActiveStep] = useState(1);
  const caravanContent =
    caravanData?.caravanContentByPath?.item ??
    caravanData?.caravanformmodelByPath?.item ??
    fallbackContent;

  const steps = [
    {
      id: 1,
      headingProp: 'step1heading',
      ctaProp: 'step1cta',
      heading: caravanContent.step1heading,
      cta: caravanContent.step1cta,
    },
    {
      id: 2,
      headingProp: 'step2heading',
      ctaProp: 'step2cta',
      heading: caravanContent.step2heading,
      cta: caravanContent.step2cta,
    },
    {
      id: 3,
      headingProp: 'step3heading',
      ctaProp: 'step3cta',
      heading: caravanContent.step3heading,
      cta: caravanContent.step3cta,
    },
  ];

  return (
    <HelmetProvider>
        <Helmet>
					<meta name="urn:adobe:aue:system:aemconnection" content={`aem:${process.env.NEXT_PUBLIC_AEM_CONNECTION}`}/>
					{ process.env.NEXT_PUBLIC_SERVICE && <meta name="urn:adobe:aue:config:service" content={`service:${process.env.NEXT_PUBLIC_SERVICE}`}/> }
				</Helmet>
    <div className="caravan-form-steps">
      {steps.map((step) => {
        const isVisible = activeStep === step.id;

        return isVisible ? (
          <div key={step.id} className="caravan-form-step" data-step={step.id}>
            <h3
              data-aue-resource={caravanResource}
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
                    <p className="caravan-confirm-title">2017 CRUSADER CARAVAN</p>
                    <p className="caravan-confirm-subtitle">Family Castle</p>
                  </div>

                  <div className="caravan-confirm-illustration" aria-hidden="true">
                    <svg viewBox="0 0 340 190" role="presentation">
                      <ellipse cx="150" cy="164" rx="118" ry="13" className="caravan-shadow" />
                      <path
                        className="caravan-body"
                        d="M28 106c0-43 10-93 58-97 42-3 108 1 143 2 19 1 30 15 37 35l12 35c6 8 18 31 18 43 0 18-14 27-34 29-28 2-168 6-196 0-25-5-38-20-38-47Z"
                      />
                      <rect x="46" y="41" width="90" height="33" rx="8" className="caravan-body" />
                      <rect x="153" y="40" width="38" height="35" rx="8" className="caravan-body" />
                      <rect x="207" y="43" width="44" height="90" rx="6" className="caravan-door" />
                      <line x1="39" y1="99" x2="196" y2="99" className="caravan-line" />
                      <line x1="216" y1="95" x2="224" y2="95" className="caravan-line" />
                      <line x1="260" y1="99" x2="285" y2="99" className="caravan-line" />
                      <circle cx="116" cy="145" r="23" className="caravan-wheel" />
                      <circle cx="178" cy="145" r="23" className="caravan-wheel" />
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
                          <li>review and update any prefilled information, if needed.</li>
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
                        To the <a href="#">terms and conditions of use</a> and{' '}
                        <a href="#">RACV Privacy Charter</a>.
                      </div>
                    </li>
                  </ul>
                  <p className="caravan-agreement-note">
                    Your answers help determine if insurance can be offered, and on what
                    terms. If you don&apos;t agree to these terms, call us to discuss your
                    options.
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
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Residential</strong>
                        <small>I live in it</small>
                      </span>
                    </label>

                    <label className="caravan-choice-card">
                      <input type="radio" name="usageType" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Recreational</strong>
                        <small>I use it for holidays and weekends</small>
                      </span>
                    </label>

                    <label className="caravan-choice-card caravan-choice-card-selected">
                      <input type="radio" name="usageType" defaultChecked />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Rental accommodation</strong>
                        <small>I live in it and rent it out</small>
                      </span>
                    </label>

                    <label className="caravan-choice-card">
                      <input type="radio" name="usageType" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Business use</strong>
                      </span>
                    </label>
                  </div>

                  <div className="caravan-usage-section-header">
                    <p className="caravan-usage-question">How do you rent it out?</p>
                  </div>

                  <div className="caravan-usage-grid caravan-usage-grid-two">
                    <label className="caravan-choice-card">
                      <input type="radio" name="rentOutType" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Privately</strong>
                      </span>
                    </label>

                    <label className="caravan-choice-card caravan-choice-card-selected">
                      <input type="radio" name="rentOutType" defaultChecked />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>On an app or website</strong>
                        <small>Like Camplify or Outdoorsy</small>
                      </span>
                    </label>
                  </div>

                  <div className="caravan-usage-section-header caravan-usage-section-header-compact">
                    <p className="caravan-usage-question">
                      How much of your caravan&apos;s time is spent rented out?
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
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Yes</strong>
                        <small>I take my caravan on the road</small>
                      </span>
                    </label>

                    <label className="caravan-choice-card">
                      <input type="radio" name="moveCaravan" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
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
                      In the next 12 months, will you park your caravan at {`{address}`} for
                      an extended period of time?
                    </p>
                    <p className="caravan-usage-helper">
                      Pay less for your cover by telling us when you park your caravan here -
                      this is called a lay up period.
                    </p>
                  </div>

                  <div className="caravan-usage-grid caravan-usage-grid-two">
                    <label className="caravan-choice-card">
                      <input type="radio" name="parkExtended" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
                      <span className="caravan-choice-copy">
                        <strong>Yes</strong>
                      </span>
                    </label>

                    <label className="caravan-choice-card">
                      <input type="radio" name="parkExtended" />
                      <span className="caravan-choice-indicator" aria-hidden="true" />
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
                  ? 'caravan-step-cta caravan-step-cta-confirm'
                  : step.id === 3
                    ? 'caravan-step-cta caravan-step-cta-usage'
                    : 'caravan-step-cta'
              }
              data-aue-resource={caravanResource}
              data-aue-type="text"
              data-aue-prop={step.ctaProp}
              data-aue-filter="cf"
              onClick={() => setActiveStep((current) => Math.min(current + 1, 4))}
            >
              {step.cta}
            </button>
          </div>
        ) : null;
      })}

      {activeStep === 4 ? (
        <div className="caravan-form-step caravan-form-success" data-step="success">
          <div
            data-aue-resource={caravanResource}
            data-aue-prop="finalstepmessage"
            data-aue-type="richtext"
            data-aue-filter="cf"
          >
            {mapJsonRichText(caravanContent.finalstepmessage[0]?.json) ??
              'Congratulations! You have done it!'}
          </div>
        </div>
      ) : null}
    </div>
    </HelmetProvider>
  );
}
