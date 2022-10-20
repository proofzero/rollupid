/**
 * @file routes/dashboard/app/new/collaborators.tsx
 */

import * as React from "react";
import { Form, useActionData, useParams } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";

import { getSession, parseJWT, redirectTo, requireJWT } from "~/shared/utilities/session.server";
import { cleanApplication, createApplication, updateApplication } from "~/models/app.server";

import DocsLink from "~/components/DocsLink";
import { WizardFlow, WizardStep, WizardStepStatus } from "~/components/WizardFlow";

import trash from "~/images/trash.svg";

// Action
// -----------------------------------------------------------------------------

interface ActionData {
  errors?: {
    title?: string;
    blockchain?: string;
    wallet?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request);

  const formData = await request.formData();

  const appId = formData.get("appId");
  const next = formData.get("next");
  // TODO error check

  const name = formData.get("name");
  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  const blockchain = formData.get("blockchain");
  if (typeof blockchain !== "string" || blockchain.length === 0) {
    return json<ActionData>(
      { errors: { name: "Blockchain is required" } },
      { status: 400 }
    );
  }

  const wallet = formData.get("wallet");
  if (typeof wallet !== "string" || wallet.length === 0) {
    return json<ActionData>(
      { errors: { name: "Wallet ID is required" } },
      { status: 400 }
    );
  }

  // TEMP
  const collaborators = [
    { name, blockchain, wallet },
  ];

  // Create a remote application record.
  const session = await getSession(request);
  const app = await updateApplication(session, appId, {
    collaborators,
  });

  // TODO manage this request in another dedicated loader.

  // Store the application remotely.
  const result = await createApplication(jwt, app);
  // TODO handle rejected promise on error

  // Destroy location application session data if write successful.
  cleanApplication(session, appId);

  return redirectTo(next, session);
};

// CollabStep
// -----------------------------------------------------------------------------

type CollabStepProps = {

};

const CollabStep = (props: CollabStepProps) => {
  const { appId } = useParams();

  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const blockchainRef = React.useRef<HTMLInputElement>(null);
  const walletRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1 text-gray-500">
      <input type="hidden" name="appId" value={appId} />
      <div className="flex flex-row gap-1">
        <p className="pb-3 grow">Doloribus dolores nostrum quia qui natus officia quod et dolorem.</p>
        <DocsLink link="/app/collaborators" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-1">
          <label>
            <div className="font-bold">Name</div>
            <input
              ref={nameRef}
              name="name"
              className="rounded-md border border-gray-300 text-lg px-2 md:w-48 leading-loose focus:border-indigo-500"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }/>
          </label>
          <label>
            <div className="font-bold">Blockchain</div>
            <input
              ref={blockchainRef}
              name="blockchain"
              className="rounded-md border border-gray-300 text-lg px-2 md:w-32 leading-loose focus:border-indigo-500"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.blockchain ? "blockchain-error" : undefined
              }/>
          </label>
          <label>
            <div className="font-bold">Wallet ID</div>
            <input
              ref={walletRef}
              name="wallet"
              className="rounded-md border border-gray-300 text-lg px-2 md:w-80 leading-loose focus:border-indigo-500"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.wallet ? "wallet-error" : undefined
              }/>
          </label>
          <div className="mt-6 grow-0 grid place-items-center min-w-[38px] w-[38px] min-h-[38px] h-[38px]">
            <img src={trash} alt="Trash icon" />
          </div>
        </div>
        <div>
          <p className="text-indigo-500 text-sm">+ Add More</p>
        </div>
      </div>
      {actionData?.errors?.title && (
        <div className="pt-1 text-red-700" id="title-error">
          {actionData.errors.title}
        </div>
      )}
    </div>
  );
};

// Component
// -----------------------------------------------------------------------------
// This component defines the "Add Domain(s)" step in the new
// Application Wizard flow.

export default function AddDomainsPage() {
  const { appId } = useParams();
  const back = `/dashboard/new/${appId}/scopes`;
  const next = `/dashboard/apps/${appId}/settings`;

  return (
    <WizardFlow>
      <WizardStep label="Application Details" status={WizardStepStatus.Complete} />
      <WizardStep label="Add Domain(s)" status={WizardStepStatus.Complete} />
      <WizardStep label="Scopes" status={WizardStepStatus.Complete} />
      <WizardStep
        label="Collaborators"
        status={WizardStepStatus.Current}
        appId={appId}
        action="."
        back={back}
        next={next}
        >
        <CollabStep />
      </WizardStep>
    </WizardFlow>
  );
}
