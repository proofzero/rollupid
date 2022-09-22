import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { Label, TextInput } from "flowbite-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "wagmi";
import { Button, ButtonSize, ButtonType } from "~/components/buttons";

import Heading from "~/components/typography/Heading";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

import currentStep from "~/assets/onboard/current.png";
import nextStep from "~/assets/onboard/next.png";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const data = await oortSend("kb_getData", ["3id.profile", "nickname"], {
    jwt,
    cookie: request.headers.get("Cookie") as string | undefined,
  });

  const nickname = data.result?.value;
  return json({
    nickname,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const form = await request.formData();
  const nickname = form.get("nickname");
  const chainId = form.get("chainId");

  const errors: {
    nickname?: string;
    chainId?: string;
  } = {};

  if (typeof nickname !== "string" || nickname === "") {
    errors.nickname = "Nickname needs to be provided";
  }

  if (typeof chainId !== "string" || chainId === "") {
    errors.chainId = "ChainId needs to be provided";
  }

  const data = await oortSend(
    "kb_setData",
    ["3id.profile", "nickname", nickname],
    {
      jwt,
      cookie: request.headers.get("Cookie") as string | undefined,
    }
  );

  if (data.error) {
    errors.nickname = "Failed persisting nickname";
  }

  if (Object.keys(errors).length) {
    return json(errors, { status: 422 });
  }

  // @ts-ignore
  return redirect(`/onboard/mint?chainId=${chainId}`);
};

const OnboardNickname = () => {
  const { nickname: storedNickname } = useLoaderData();
  const [nickname, setNickname] = useState(storedNickname);

  const { chain } = useNetwork();

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/onboard/mint/load-voucher?chainId=${chain?.id || 5}`);
    }
  }, [fetcher]);

  const submit = useSubmit();
  const postNickname = useCallback(() => {
    submit(
      {
        nickname,
        chainId: `${chain?.id || 5}`,
      },
      {
        method: "post",
      }
    );
  }, [nickname]);

  const actionErrors = useActionData();

  return (
    <>
      <div className="flex justify-center items-center space-x-4 mb-10">
        <img src={currentStep} />
        <img src={nextStep} />
        <img src={nextStep} />
      </div>

      <Heading className="text-center">How should we call you?</Heading>

      <section
        id="onboard-nickname-form"
        className="flex-1 flex justify-center items-center"
      >
        <div>
          <Label htmlFor="display-name">
            <Text
              className="mb-1.5"
              size={TextSize.SM}
              weight={TextWeight.Medium500}
              color={TextColor.Gray700}
            >
              *Display Name
            </Text>

            {actionErrors?.nickname && (
              <Text
                className="mb-1.5"
                size={TextSize.XS}
                weight={TextWeight.Regular400}
                color={TextColor.Gray400}
              >
                {actionErrors.nickname}
              </Text>
            )}
          </Label>

          <TextInput
            id="nickname"
            type="text"
            placeholder="Ash"
            required={true}
            onChange={(event) => setNickname(event.target.value)}
            value={nickname}
            helperText={
              <Text
                type="span"
                className="mt-2"
                size={TextSize.XS}
                weight={TextWeight.Regular400}
                color={TextColor.Gray400}
              >
                You can always change this later in the settings
              </Text>
            }
          />
        </div>
      </section>

      <section
        id="onboard-nickname-actions"
        className="flex justify-end items-center space-x-4 pt-10 lg:pt-0"
      >
        <Button
          id="onboard-nickname-continue"
          disabled={!nickname || nickname === ""}
          size={ButtonSize.L}
          onClick={() => {
            postNickname();
          }}
        >
          Continue
        </Button>
      </section>
    </>
  );
};

export default OnboardNickname;
