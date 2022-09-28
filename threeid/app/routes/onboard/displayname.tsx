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
  useTransition,
  PrefetchPageLinks,
} from "@remix-run/react";
import { Label, TextInput, Spinner } from "flowbite-react";

import { useEffect, useState } from "react";
import { Button, ButtonSize, ButtonType } from "~/components/buttons";


import Heading from "~/components/typography/Heading";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

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

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/onboard/mint/load-voucher`);
    }
  }, [fetcher]);

  const actionErrors = useActionData();
  const transition = useTransition();

  return (
    <>
      <ol role="list" className="mx-auto flex items-center space-x-5">
        <li>
          <a href={"/onboard/displayname"} className="relative flex items-center justify-center" aria-current="step">
            <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span className="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span className="sr-only">{"Nickname"}</span>
          </a>
        </li>

        <li>
          <a href="/onboard/mint" className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
            <span className="sr-only">{"Mint"}</span>
          </a>
        </li>

        <li>
          <a href="/onboard/ens" className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
            <span className="sr-only">{"ENS"}</span>
          </a>
        </li>
      </ol>

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
            autoFocus={true}
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
          {transition.state === "submitting" || transition.state === "loading" ? <Spinner /> :
            <Button
              isSubmit={true}
              disabled={!nickname || nickname === ""}
              size={ButtonSize.L}
            >
              Continue
            </Button>
          }
        </section>

      </Form>
      <PrefetchPageLinks page="/onboard/mint" />
    </>
  );
};

export default OnboardNickname;
