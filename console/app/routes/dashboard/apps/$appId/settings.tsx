/**
 * @file app/routes/dashboard/apps/$appId/settings.tsx
 */

import invariant from "tiny-invariant";

import { useState } from "react";

import { json } from "@remix-run/cloudflare";

import { Form, Link, useCatch, useLoaderData, useOutletContext } from "@remix-run/react";

import IconPicker from "~/components/IconPicker";

import type { Scopes } from "~/models/app.server";
import { getScopes } from "~/models/app.server";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { Combobox } from "@headlessui/react";

// InputField
// -----------------------------------------------------------------------------

type InputFieldProps = {
  id: string,
  name: string,
  label: string,
  placeholder: string,
  value?: string,
  description?: string,
};

export function InputField(props: InputFieldProps) {
  const description = (props.description !== undefined) ? (
    <p className="mt-2 text-sm leading-5 font-normal text-gray-400" id={`${props.id}-description`}>
      {props.description}
    </p>
  ) : undefined;
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          name={props.name}
          id={props.id}
          defaultValue={props.value}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-500 placeholder-opacity-50"
          placeholder={props.placeholder}
        />
      </div>
      {description}
    </div>
  );
}

// InputErrorField
// -----------------------------------------------------------------------------

import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

type InputErrorFieldProps = {
  id: string,
  name: string,
  label: string,
  placeholder: string,
  default: string,
  error: string,
};

export function InputErrorField(props: InputErrorFieldProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type="text"
          name={props.name}
          id={props.id}
          className="block w-full rounded-md border-gray-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
          placeholder={props.placeholder}
          defaultValue={props.default}
          aria-invalid="true"
          aria-describedby={`${props.id}-error`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 text-sm text-red-600" id={`${props.id}-error`}>
        {props.error}
      </p>
    </div>
  );
}

// SecretField
// -----------------------------------------------------------------------------

import { EyeSlashIcon } from "@heroicons/react/24/outline";

type SecretFieldProps = {
  id: string,
  name: string,
  label: string,
  value?: string,
};

export function SecretField(props: SecretFieldProps) {
  return (
    <div>
      <label htmlFor="account-number" className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type="password"
          name={props.name}
          id={props.id}
          defaultValue={props.value}
          className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={props.placeholder}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <EyeSlashIcon className="h-5 w-5 text-gray-400 font-bold" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

// InputUrlField
// -----------------------------------------------------------------------------

type InputUrlFieldProps = {
  id: string,
  label: string,
  name: string,
  value?: string,
  placeholder?: string,
  prefix?: string,
};

export function InputUrlField(props: InputUrlFieldProps) {
  const placeholder = (props?.placeholder !== undefined) ? props.placeholder : "www.example.com";
  const prefix = (props?.prefix !== undefined) ? props.prefix : "http://";

  return (
    <div>
      <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
          {prefix}
        </span>
        <input
          type="text"
          name={props.name}
          id={props.id}
          defaultValue={props.value}
          className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-500 placeholder-opacity-50"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

// PublishToggle
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

type PublishToggleProps = {
  // Is it published?
  is: boolean,
};

export function PublishToggle({ is }: PublishToggleProps) {
  const [enabled, setEnabled] = useState(is);

  const labelText = enabled ? "Published" : "Unpublished";

  return (
    <Switch.Group as="div" className="flex items-center justify-between">
      <span className="flex flex-grow flex-col px-4">
        <Switch.Label as="span" className="text-normal font-medium text-gray-500" passive>
          {labelText}
        </Switch.Label>
      </span>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={classNames(
          enabled ? "bg-green-500" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
    </Switch.Group>
  )
}

// InputScopesCategory
// -----------------------------------------------------------------------------

/*
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
*/

type InputScopesCategoryProps = {
  id: string;
  options: Array<string>;
  category: string;
};

export function InputScopesCategory({ id, options, }: InputScopesCategoryProps) {
  const [query, setQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState();

  const filteredScopes =
    query === ""
      ? options
      : options.filter((scope) => {
          return scope.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox as="div" value={selectedScope} onChange={setSelectedScope}>
      <div className="relative mt-1">
        <Combobox.Input
          id={`${id}-scope`}
          className="w-full rounded-md rounded-r-none border border-gray-300 border-r-0 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(profile) => profile?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredScopes.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredScopes.map((category, idx) => (
              <Combobox.Option
                key={idx}
                value={category}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={classNames("block truncate", selected && "font-semibold")}>{category}</span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

// InputScopesData
// -----------------------------------------------------------------------------

const data = [
  { id: 1, name: "All Data" },
];

type InputScopesPermissionProps = {
  id: string,
};

export function InputScopesPermission(props: InputScopesPermissionProps) {
  const [query, setQuery] = useState("");
  const [selectedDatum, setSelectedDatum] = useState();

  const filteredData =
    query === ''
      ? data
      : data.filter((datum) => {
          return datum.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox as="div" value={selectedDatum} onChange={setSelectedDatum}>
      <div className="relative mt-1">
        <Combobox.Input
          id={`${props.id}-data`}
          className="w-full rounded-md rounded-l-none border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(datum) => datum?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredData.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData.map((datum) => (
              <Combobox.Option
                key={datum.id}
                value={datum}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={classNames("block truncate", selected && "font-semibold")}>{datum.name}</span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

// InputScopesField
// -----------------------------------------------------------------------------

type InputScopesFieldProps = {
  // A unique ID for this control
  id: string;
  // A name useable as part of a form
  name: string;
  // A list of all available scopes
  scopes: Array<Scope>;
  // The selected category part of the scope
  category: string;
  // The selecte permission part of the scope
  permission: string;
};

export function InputScopesField({ id, scopes, category, permission }: InputScopesFieldProps) {
  const categories = scopes.map(scope => { return scope.category });
  const permissions = scopes.map(scope => { return scope.permission });
  return (
    <div id={id} className="flex flex-row">
      <InputScopesCategory id={id} options={categories} category={category}  />
      <InputScopesPermission id={id} options={permissions} permission={permission} />
    </div>
  );
}

// InputScopes
// -----------------------------------------------------------------------------

type InputScopesProps = {
  // A list of all the application scopes.
  appScopes: Array<Scope>;
  // A list of all available scopes.
  allScopes: Array<Scope>;
}

export function InputScopes({ allScopes, appScopes, }: InputScopesProps) {
  const inputScopes = appScopes.map((scope, idx) => {
    return (
      <InputScopesField
        key={idx}
        id={`app-scopes-${idx}`}
        name={`app_scopes_${idx}`}
        scopes={allScopes}
        category={scope.category}
        permission={scope.permission}
      />
    );
  });
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Scopes
      </label>
      {inputScopes}
    </div>
  );
}

// Loader
// -----------------------------------------------------------------------------
// TODO move this to parent

type LoaderData = {
  scopes: Awaited<ReturnType<typeof getScopes>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const scopes = await getScopes();
  return json<LoaderData>({ scopes });
};

// Component
// -----------------------------------------------------------------------------

import type { ContextType } from "../$appId";

import { getScopes } from "~/models/app.server";

// <InputErrorField id="app-id" name="app_id" label="App ID" placeholder="123412341234123" error="Example error text" />

export default function AppConfigPage() {
  const { scopes } = useLoaderData() as LoaderData;
  const { app } = useOutletContext<ContextType>();

  return (
    <div>
      <div className="flex flex-col md:flex-row basis-full gap-2 justify-between mb-8 md:items-center">
        <h3 className="text-2xl font-bold">Settings</h3>
        <button
          type="button"
          className="inline-flex flex-row flex-initial items-center justify-center md:basis-auto rounded-md border border-transparent bg-indigo-600 px-8 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
          Save
        </button>
      </div>
      <div className="flex flex-col md:flex-row-reverse gap-2">
        <div className="flex flex-col md:flex-row-reverse gap-2 items-center w-full justify-between mb-4">
          <div className="flex flex-col w-full md:basis-2/6 self-start content-start items-start md:items-end">
            <h4 className="text-gray-900 font-bold mb-4">Application Status</h4>
            <div className="flex flex-row w-full justify-center md:justify-end mb-6">
              <PublishToggle is={app.published} />
            </div>
          </div>
          <div className="items-start">
            <div>
              <h4 className="text-gray-900 font-bold pb-4">API Keys</h4>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                <div className="md:basis-1/2">
                  <InputField id="app-id" name="app_id" label="Application ID" value={app.id} />
                </div>
                <div className="flex flex-col w-full gap-2 md:flex-row md:justify-between">
                  <div className="grow">
                    <SecretField id="app-secret" name="app_secret" label="App Secret" placeholder="" value={app.secret} />
                  </div>
                  <div className="flex flex-col items-center md:items-end text-xs leading-4 font-medium">
                    <p className="pt-6 text-gray-400">Created: 2022-08-28</p>
                    <Link className="text-indigo-500" to="">Roll Keys</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-gray-900 font-bold py-4">Details</h4>
              <div className="flex flex-col gap-2 md:gap-6">
                <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                  <div className="md:basis-1/2">
                    <InputField id="app-name" name="app_name" label="Application Name" value={app.name} />
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <InputScopes allScopes={scopes} appScopes={app.scopes} />
                    <div className="pt-6 text-xs leading-4 font-medium">
                      + <Link className="text-indigo-500" to="">Add more Scopes</Link>
                    </div>
                  </div>
                </div>
                <InputField
                  id="app-domains"
                  name="app_domains"
                  label="Domain(s)"
                  description="Inputs are separated with a space"
                  value={app.domains.join(" ")} />
                <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                  <div className="basis-full">
                    <InputUrlField id="app-website" name="app_redirect" label="Redirect URL" value={app.redirectURL} />
                  </div>
                  <div className="basis-full">
                    <InputUrlField id="app-tos" name="app_tos" label="Terms of Service URL" value={app.termsURL} />
                  </div>
                </div>
                <IconPicker url={app.icon} />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-gray-900 font-bold py-4">Links</h4>
              <div className="grid grid-cols-1 gap-2 md:gap-8 md:grid-cols-2">
                <InputUrlField id="app-website" name="app_website" label="Website" value={app.websiteURL} />
                <InputUrlField id="app-mirror" name="app_mirror" label="Mirror" value={app.mirrorURL} />
                <InputUrlField id="app-discord" name="app_discord" label="Discord" prefix="@" placeholder="username" value={app.discordUser} />
                <InputUrlField id="app-twitter" name="app_twitter" label="Twitter" prefix="@" placeholder="username" value={app.twitterUser} />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-gray-900 font-bold py-4">Danger Zone</h4>
              <div className="flex flex-col items-center md:items-start gap-2 md:gap-6">
                <Link className="text-red-500 text-sm" to="../delete">Delete the App</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
