import {
  ActionFunction,
  json,
  LoaderFunction,
} from "@remix-run/cloudflare";

import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useActionData,
  useTransition,
  Form,
  PrefetchPageLinks,
} from "@remix-run/react";

import {
  Label,
  Spinner,
} from "flowbite-react";

import Heading from "~/components/typography/Heading";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import { getUserSession } from "~/utils/session.server";

import { useEffect, useState } from "react";

import styles from "~/styles/onboard.css";

import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import { oortSend } from "~/utils/rpc.server";

import ensLogo from "~/assets/ens.png";
import { useNetwork, useAccount } from "wagmi";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  const addressLookup = await oortSend("ens_lookupAddress", [address], {
    jwt,
    cookie: request.headers.get("Cookie") as string | undefined,
  });

  const coreEnsLookup = await oortSend("kb_getCoreAddresses", [["ens"]], {
    jwt,
    cookie: request.headers.get("Cookie") as string | undefined,
  });

  let isSetOnCore = false;
  if (coreEnsLookup.result?.ens?.length > 0) {
    isSetOnCore = true;
  }

  const ensName = addressLookup.result;
  return json({
    account: address,
    ensName,
    isSetOnCore,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  const formData = await request.formData();
  const operation = formData.get("operation");

  let ensRes = null;
  if (operation === "register") {
    ensRes = await oortSend("3id_registerName", [address], {
      jwt: jwt,
      cookie: request.headers.get("Cookie") as string,
    });
  } else {
    ensRes = await oortSend("3id_unregisterName", [address], {
      jwt: jwt,
      cookie: request.headers.get("Cookie") as string,
    });
  }

  if (ensRes.error) {
    return json({ error: true, operation }, { status: 500 });
  }

  return json({ error: false, operation }, { status: 200 });
};

const OnboardEns = () => {
  const navigate = useNavigate();

  const submit = useSubmit();

  const { isConnected, address } = useAccount()
  const { chain } = useNetwork();

  const { ensName, isSetOnCore, account } = useLoaderData();

  const [ensChecked, setEnsChecked] = useState<boolean>(isSetOnCore);
  const [validating, setValidating] = useState<boolean>(true);

  const data = useActionData();

  const [invalidChain, setInvalidChain] = useState(false);
  useEffect(() => {
    if (chain && chain.id != window.ENV.NFTAR_CHAIN_ID) {
      setInvalidChain(true);
    } else {
      setInvalidChain(false);
    }
  }, [chain]);

  const [invalidAddress, setInvalidAddress] = useState(false);
  useEffect(() => {
    if (address && address !== account) {
      setInvalidAddress(true);
    } else {
      setInvalidAddress(false);
    }
  }, [address]);


  useEffect(() => {
    if (data?.error && data.operation === "register") {
      setEnsChecked(false);
    } else if (data?.error && data.operation === "unregister") {
      setEnsChecked(true);
    } else if (data) {
      if (data.operation === "register") {
        setEnsChecked(true);
      } else if (data.operation === "unregister") {
        setEnsChecked(false);
      }
    }

    setValidating(false);
  }, [data]);

  useEffect(() => {
    setValidating(false);
  }, [ensName]);

  const handleEnsToggle = async (checked: boolean) => {
    setValidating(true);

    if (checked) {
      postEnsRequest("register");
    } else {
      postEnsRequest("unregister");
    }
  };

  const postEnsRequest = (operation: "register" | "unregister") => {
    submit(
      {
        operation,
      },
      {
        method: "post",
      }
    );
  };

  const transition = useTransition();

  return (
    <>
      <ol role="list" className="mx-auto flex items-center space-x-5">
        <li>
          <a href="/onboard/name" className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
            <span className="sr-only">{"Nickname"}</span>
          </a>
        </li>

        <li>
          <a href="/onboard/mint" className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
            <span className="sr-only">{"Mint"}</span>
          </a>
        </li>

        <li>
          <a href={"/onboard/ens"} className="relative flex items-center justify-center" aria-current="step">
            <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span className="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span className="sr-only">{"ENS"}</span>
          </a>
        </li>
      </ol>

      <Heading className="text-center">Almost there!</Heading>

      <section
        id="onboard-ens-form"
        className="flex-1 flex flex-col justify-center"
      >
        <div
          className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 p-4"
          style={{
            backgroundColor: "#F9FAFB",
          }}
        >
          <img
            className="mx-auto"
            src={ensLogo}
            style={{
              height: 172,
              width: 264,
            }}
          />

          <div className="flex flex-col justify-between">
            <div>
              <Text
                className="mb-2"
                weight={TextWeight.SemiBold600}
                color={TextColor.Gray800}
              >
                You can set your primary ENS domain as profile URL
              </Text>
              <Text
                className="mb-9"
                size={TextSize.SM}
                color={TextColor.Gray400}
                weight={TextWeight.Regular400}
              >
                If you don’t own an ENS domain or you decide to not use it we
                will use your blockchain account IDs instead.
              </Text>
            </div>

            {invalidChain && <Text
              className="ml-3"
              size={TextSize.SM}
              weight={TextWeight.Medium500}>
              **Please select switch your network to {window.ENV.VALID_CHAIN_ID_NAME}**
            </Text>}
            {invalidAddress && <Text
              className="ml-3"
              size={TextSize.SM}
              weight={TextWeight.Medium500}>
              **Please connect your wallet to {account}**
            </Text>}
            {!isConnected && <Text
              className="ml-3"
              size={TextSize.SM}
              weight={TextWeight.Medium500}>
              **Please unlock your wallet and reload the page**
            </Text>}
            {!invalidChain && !invalidAddress && isConnected &&
              <Label htmlFor="use-ens">
                <div className="flex flex-row space-x-3.5 items-center">
                  <label
                    htmlFor="use-ens"
                    className={`inline-flex relative items-center mb-5 cursor-${!validating && !ensName ? "default" : "pointer"}`}
                  >
                    {!validating && ensName && (
                      <>
                        <input
                          type="checkbox"
                          onChange={(evt) => handleEnsToggle(evt.target.checked)}
                          checked={ensChecked}
                          id="use-ens"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </>
                    )}

                    {validating && <Spinner />}

                    {(validating || ensName) && (
                      <Text
                        className="ml-3"
                        size={TextSize.SM}
                        weight={TextWeight.Medium500}
                      >
                        Use ENS domain as profile URL
                      </Text>
                    )}

                    {!validating && !ensName && (
                      <Text
                        className="ml-3"
                        size={TextSize.SM}
                        weight={TextWeight.Medium500}
                      >
                        ☹️ Sorry, no primary ENS linked to your ETH account
                      </Text>
                    )}
                  </label>
                </div>
              </Label>
            }
          </div>
        </div>
      </section>

      <section
        id="onboard-ens-actions"
        className="flex justify-end items-center space-x-4 pt-10 lg:pt-0"
      >
        {transition.state === "submitting" || transition.state === "loading" ? <Spinner /> : (<>

          <div className="w-full lg:w-auto">
            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.L}
              onClick={() => {
                // @ts-ignore
                navigate(`/onboard/mint`);
              }}
            >
              Back
            </Button>
          </div>
          <Form className="w-full lg:w-auto" method="post" action="/onboard/complete">
            <Button
              isSubmit={true}
              disabled={validating}
              size={ButtonSize.L}
            >
              Finish
            </Button>
          </Form>
        </>)}
      </section>
      <PrefetchPageLinks page="/onboard/mint" />
    </>
  );
};

export default OnboardEns;
