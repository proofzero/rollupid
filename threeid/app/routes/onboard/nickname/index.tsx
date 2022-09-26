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

  const errors: {
    nickname?: string;
  } = {};

  if (typeof nickname !== "string" || nickname === "") {
    errors.nickname = "Nickname needs to be provided";
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
  return redirect(`/onboard/mint`);
};

const OnboardNickname = () => {
  const { nickname: storedNickname } = useLoaderData();
  const [nickname, setNickname] = useState(storedNickname || "");

  const { chain } = useNetwork();

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/onboard/mint/load-voucher`);
    }
  }, [fetcher]);

  const actionErrors = useActionData();

  return (
    <>

      <div className="flex justify-center items-center space-x-4 mb-10">
        <img src={currentStep} />
        <img src={nextStep} />
        <img src={nextStep} />
      </div>

      <Heading className="flex flex-1 text-center justify-center items-center">What should we call you?</Heading>
      
      <Form method="post"
          className="flex flex-1 flex-col justify-center items-center"
      >

        <section
          id="onboard-nickname-form"
          className="flex-1 justify-center items-center items-stretch self-center"
        >
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
            name="nickname"
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
        </section>

        <section
          id="onboard-nickname-actions"
          className="flex flex-1 justify-end w-full items-end space-x-4 pt-10 lg:pt-0"
        >
          <Button
            isSubmit={true}
            disabled={!nickname || nickname === ""}
            size={ButtonSize.L}
          >
            Continue
          </Button>
        </section>
  
      </Form>

    </>
  );
};

export default OnboardNickname;
