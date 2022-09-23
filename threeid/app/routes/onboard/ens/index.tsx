import { ActionFunction, json, redirect } from "@remix-run/cloudflare";

import {
  useLoaderData,
  useNavigate,
  useFetcher,
  useSubmit,
  useActionData,
} from "@remix-run/react";

import {
  Card,
  Checkbox,
  Label,
  Radio,
  RadioProps,
  Spinner,
  ToggleSwitch,
} from "flowbite-react";

import Heading from "~/components/typography/Heading";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import { getUserSession } from "~/utils/session.server";

import { useCallback, useEffect, useState } from "react";

import styles from "~/styles/onboard.css";

import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import { oortSend } from "~/utils/rpc.server";

import ensLogo from "~/assets/ens.png";
import { useAccount, useEnsName, useNetwork } from "wagmi";

import prevStep from "~/assets/onboard/pre.png";
import currentStep from "~/assets/onboard/current.png";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  const ensRes = await oortSend("3id_registerName", [address], {
    jwt: jwt,
    cookie: request.headers.get("Cookie") as string,
  });

  if (ensRes.error) {
    return json({ error: true }, { status: 500 });
  }

  return json({ error: false }, { status: 200 });
};

const OnboardEns = () => {
  const { chain } = useNetwork();

  const [ensChecked, setEnsChecked] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(true);

  const { address } = useAccount();
  const { isSuccess } = useEnsName({
    address: address,
  });

  const data = useActionData();

  useEffect(() => {
    if (data?.error) {
      setEnsChecked(false);
    }
  }, [data]);

  const submit = useSubmit();

  useEffect(() => {
    setValidating(false);
  }, [isSuccess]);

  const handleEnsToggle = async (checked: boolean) => {
    setValidating(true);

    if (checked) {
      postEnsRequest();
      setEnsChecked(true);
    } else {
      setEnsChecked(false);
    }

    setValidating(false);
  };

  const postEnsRequest = useCallback(() => {
    submit(
      {},
      {
        method: "post",
      }
    );
  }, []);

  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-center items-center space-x-4 mb-10">
        <img src={prevStep} />
        <img src={prevStep} />
        <img src={currentStep} />
      </div>

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

            <Label htmlFor="use-ens">
              <div className="flex flex-row space-x-3.5 items-center">
                <label
                  htmlFor="use-ens"
                  className="inline-flex relative items-center mb-5 cursor-pointer"
                >
                  {!validating && isSuccess && (
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

                  {(validating || isSuccess) && (
                    <Text
                      className="ml-3"
                      size={TextSize.SM}
                      weight={TextWeight.Medium500}
                    >
                      Use ENS domain as profile URL
                    </Text>
                  )}

                  {!validating && !isSuccess && (
                    <Text
                      className="ml-3"
                      size={TextSize.SM}
                      weight={TextWeight.Medium500}
                    >
                      Sorry, no primary ens linked
                    </Text>
                  )}
                </label>
              </div>
            </Label>
          </div>
        </div>
      </section>

      <section
        id="onboard-ens-actions"
        className="flex justify-end items-center space-x-4 pt-10 lg:pt-0"
      >
        <Button
          type={ButtonType.Secondary}
          size={ButtonSize.L}
          onClick={() => {
            // @ts-ignore
            navigate(`/onboard/mint?chainId=${chain?.id || 5}`);
          }}
        >
          Back
        </Button>

        <Button
          disabled={validating}
          size={ButtonSize.L}
          onClick={() => {
            navigate(`/account`);
          }}
        >
          Finish
        </Button>
      </section>
    </>
  );
};

export default OnboardEns;
