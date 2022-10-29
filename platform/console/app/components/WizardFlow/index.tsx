/**
 * @file app/shared/components/WizardFlow/index.tsx
 */

import * as React from "react";

import { Form, Link } from "@remix-run/react";

// BackButton
// -----------------------------------------------------------------------------

type BackButtonProps = {
  // Button label text
  label: string,
  // Target link
  link?: string,
};

const BackButton = (props: BackButtonProps) => {
  const link = props?.link ? props.link : "";
  return (
    <button className="flex-1 md:flex-initial md:w-1/6 rounded bg-white border border-gray-300 px-4 py-2 hover:bg-indigo-500 hover:text-white focus:bg-indigo-400" type="">
      <Link to={link}>{props.label}</Link>
    </button>
  );
};

// NextButton
// -----------------------------------------------------------------------------

type NextButtonProps = {
  // Button label text
  label: string,
};

const NextButton = (props: NextButtonProps) => {
  return (
    <button type="submit" className="flex-1 md:flex-initial md:w-1/6 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-500 focus:bg-indigo-400">
      {props.label}
    </button>
  );
};

// WizardStepComplete
// -----------------------------------------------------------------------------

const WizardStepComplete = () => {
  return (
    <div className="inline-block bg-indigo-600 text-white text-2xl leading-[2.5rem] rounded-full w-10 h-10 text-center mr-2 align-middle">✔</div>
  );
};

// WizardStepCurrent
// -----------------------------------------------------------------------------

const WizardStepCurrent = () => {
  return (
    <div className="inline-block bg-white border-2 border-indigo-600 text-indigo-600 text-2xl rounded-full w-10 h-10 text-center mr-2 align-middle">●</div>
  );
}

// WizardStepUnfinished
// -----------------------------------------------------------------------------

const WizardStepUnfinished = () => {
  return (
    <div className="inline-block bg-white border-2 border-gray-300 text-indigo-600 text-2xl rounded-full w-10 h-10 text-center mr-2 align-middle">⠀</div>
  );
}

// WizardStep
// -----------------------------------------------------------------------------

enum WizardStepPosition {
  First,
  Middle,
  Last,
}

export enum WizardStepStatus {
  Complete,
  Current,
  Unfinished,
}

type WizardStepProps = {
  // The text label for the step
  label: string;
  // Whether or not the step is in-progress or complete
  status: WizardStepStatus;
  // Form target
  action?: string;
  // Position in the list of wizard steps
  position?: WizardStepPosition;
  // Link target for previous step
  back?: string;
  // Link target for next step
  next?: string;
  // Step content to display
  children?: React.ReactNode;
};

export function WizardStep (props: WizardStepProps) {
  let marker;
  let labelClass = "";
  let contentClass = "hidden";
  // These are the classes used to style the left edge line connected step markers.
  // TODO implement gradient for line that transitions from current & middle step to the subsequent step.
  let lineClass = "border-l-2 border-solid";

  let backButtonLabel = "Back";
  let nextButtonLabel = "Continue";

  switch (props.status) {
    case WizardStepStatus.Complete:
      marker = <WizardStepComplete />;
      lineClass = `${lineClass} border-indigo-600`;
      break;
    case WizardStepStatus.Current:
      marker = <WizardStepCurrent />;
      contentClass = "border border-gray-300 rounded pl-4 p-3";
      labelClass = "text-indigo-600";
      lineClass = `${lineClass} border-indigo-600`;
      break;
    case WizardStepStatus.Unfinished:
      marker = <WizardStepUnfinished />;
      lineClass = `${lineClass} border-gray-300`;
      break;
  }

  switch (props.position) {
    case WizardStepPosition.First:
      break;
    case WizardStepPosition.Middle:
      break;
    case WizardStepPosition.Last:
      // The last wizard step has no fancy left line border.
      lineClass = "";
      nextButtonLabel = "Finish";
      break;
  }

  const backButton = <BackButton label={backButtonLabel} link={props?.back} />;
  const nextButton = <NextButton label={nextButtonLabel} />;

  const buttonRow = (
    <div className="flex flex-col mt-2 md:flex-row md:justify-end gap-2">
      {props.position !== WizardStepPosition.First ? backButton : undefined}
      {nextButton}
    </div>
  );

  return (
    <Form method="post" action={props?.action} encType="multipart/form-data">
      <input type="hidden" name="next" value={props?.next} />
      <li className="py-2 -mt-4">
        <div>{marker}<span className={`uppercase font-bold text-sm ${labelClass}`}>{props.label}</span></div>
        <div className={`${lineClass} pl-6 pb-6 pr-6 ml-5`}>
          <div className={contentClass}>
            {props.children}
          </div>
          {props.status == WizardStepStatus.Current ? buttonRow : undefined}
        </div>
      </li>
    </Form>
  );
};

// WizardFlow
// -----------------------------------------------------------------------------

type WizardFlowProps = {
  children: Array<typeof WizardStep>,
};

export function WizardFlow(props: WizardFlowProps) {
  if (!props.children.map) {
    return (
      <p>Oops!</p>
    );
  }

  const steps = props.children.map((step, index) => {
    let position;
    if (index <= 0) {
      position = WizardStepPosition.First;
    } else if (index == props.children.length-1) {
      position = WizardStepPosition.Last;
    } else {
      position = WizardStepPosition.Middle;
    }
    return React.cloneElement(step, {
      key: index,
      position,
    });
  });
  return (
    <ul className="pt-4">
      {steps}
    </ul>
  );
};
