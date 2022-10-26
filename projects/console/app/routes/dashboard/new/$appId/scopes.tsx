/**
 * @file routes/dashboard/app/new/scopes.tsx
 */

import type { ActionFunction } from "@remix-run/cloudflare";

import * as React from "react";
import { Form, useActionData, useParams } from "@remix-run/react";
import { json, redirect } from "@remix-run/cloudflare";

import { getSession, redirectTo, requireJWT } from "~/shared/utilities/session.server";
import { updateApplication } from "~/models/app.server";

import DocsLink from "~/components/DocsLink";
import { WizardFlow, WizardStep, WizardStepStatus } from "~/components/WizardFlow";

// Action
// -----------------------------------------------------------------------------

type ActionData = {
  errors?: {
    scopes?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request);

  const formData = await request.formData();

  const appId = formData.get("appId");
  const next = formData.get("next");

  const scopes = formData.get("scopes");
  if (typeof scopes !== "string" || scopes.length === 0) {
    return json<ActionData>(
      { errors: { title: "Scopes are required" } },
      { status: 400 }
    );
  }

  // We assume that scopes are comma-separated.
  const data = scopes.split(/\s*,\s*/);

  const session = await getSession(request);
  const app = await updateApplication(session, appId, {
    scopes: data,
  });

  // TEMP
  console.log(app);

  return redirectTo(next, session);
};

// Dropdown
// -----------------------------------------------------------------------------

enum DropdownPosition {
  START,
  MIDDLE,
  END,
};

type DropdownProps = {
  // Text label displayed by default.
  label: string,
  // Items to display in the dropdown list.
  items: Array<string>,
  // Position of the dropdown in a group.
  position: DropdownPosition,
};

const Dropdown = (props: DropdownProps) => {
  const items = [...props.items.map(s => <a key={s} href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex="-1" id="menu-item-0">{s}</a>)];

  const dropdownList = (
    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
      <div className="py-1" role="none">
        {items}
      </div>
    </div>
  );

  let buttonClasses;
  let labelClasses;
  switch (props.position) {
    case DropdownPosition.START:
      labelClasses = "md:pr-20";
      buttonClasses = [
        "border-r-1",
        "rounded-r-none",
      ].join(" ");
    break;
    case DropdownPosition.MIDDLE:
    break;
    case DropdownPosition.END:
      buttonClasses = [
        "border-l-0",
        "rounded-l-none",
      ].join(" ");
    break;
  }

  // TODO replace all of this with Tailwind UI select menu.
  return (
    <div className="relative inline-block text-left">
      <div>
        <button type="button" className={`inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 ${buttonClasses}`} id="menu-button" aria-expanded="true" aria-haspopup="true">
          <span className={labelClasses}>{props.label}</span>
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {dropdownList && null}
    </div>
  );
};

// ScopeStep
// -----------------------------------------------------------------------------

type ScopeStepProps = {

};

const ScopeStep = (props: ScopeStepProps) => {
  const { appId } = useParams();

  const actionData = useActionData() as ActionData;

  // TEMP hard code some scopes to send; the component needs to collect that data and submit it.
  const scopes = "foo.bar, test.read";

  return (
    <div className="flex flex-col gap-1 w-full text-gray-500">
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="scopes" value={scopes} />
      <div className="flex flex-row w-full gap-1">
        <p className="pb-3 grow">Doloribus dolores nostrum quia qui natus officia quod et dolorem.</p>
        <DocsLink link="/app/scopes" />
      </div>
      <label>
        <span className="font-bold">Scopes</span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row">
            <Dropdown position={DropdownPosition.START} label="Profile" items={["foo", "bar", "baz"]} />
            <Dropdown position={DropdownPosition.END} label="All Data" items={["foo", "bar", "baz"]} />
          </div>
          <p className="text-indigo-500 text-sm">+ Add more</p>
        </div>
      </label>
      {actionData?.errors?.scopes && (
        <div className="pt-1 text-red-700" id="scopes-error">
          {actionData.errors.scopes}
        </div>
      )}
    </div>
  );
};

// Component
// -----------------------------------------------------------------------------
// This component defines the "Add Domain(s)" step in the new
// Application Wizard flow.

export default function SetScopesPage() {
  const { appId } = useParams();
  const back = `/dashboard/new/${appId}/domains`;
  const next = `/dashboard/new/${appId}/collaborators`;

  return (
    <WizardFlow>
      <WizardStep label="Application Details" status={WizardStepStatus.Complete} />
      <WizardStep label="Add Domain(s)" status={WizardStepStatus.Complete} />
      <WizardStep
        label="Scopes"
        status={WizardStepStatus.Current}
        appId={appId}
        action="."
        back={back}
        next={next}>
        <ScopeStep />
      </WizardStep>
      <WizardStep label="Collaborators" status={WizardStepStatus.Unfinished} />
    </WizardFlow>
  );
}
