import { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";

import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";

import Heading from "~/components/typography/Heading";
import Text, { TextColor, TextSize, TextWeight } from "~/components/typography/Text";

import styles from "~/styles/onboard.css";

import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import { BiInfoCircle } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useContractWrite, useAccount } from "wagmi";
import { Spinner } from "flowbite-react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

import { loader as loadVoucherLoader } from "~/routes/onboard/mint/load-voucher";

import { abi } from "~/assets/abi/mintpfp.json";

import prevStep from "~/assets/onboard/pre.png";
import currentStep from "~/assets/onboard/current.png";
import nextStep from "~/assets/onboard/next.png";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = loadVoucherLoader;

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const formData = await request.formData();

  const imgUrl = formData.get("imgUrl");
  const contractAddress = formData.get("contractAddress");

  await oortSend(
    "kb_setData",
    [
      "3id.profile",
      "pfp",
      {
        url: imgUrl,
        contractAddress: contractAddress,
        isToken: true,
      },
    ],
    {
      jwt,
      cookie: request.headers.get("Cookie") as string | undefined,
    }
  );

  return null;
};

type OnboardMintLandingProps = {
  account: string;
  metadata: object;
  minted: boolean;
  onClick: () => void;
};

const OnboardMintLand = ({
  account,
  metadata,
  minted,
  onClick,
}: OnboardMintLandingProps) => {
  const { isConnected } = useAccount()

  const traitNames = {
    "trait0": "Generation",
    "trait1": "Priority",
    "trait2": "Friend",
    "trait3": "Points",
  }

  return (
    <>
      <Text
        className="mb-4 flex flex-row space-x-4 items-center"
        color={TextColor.Gray400}
      >
        <BiInfoCircle />
        <span>
          This image was generated using the assets your{" "}
          <b className="cursor-default" title={account}>
            blockchain account.
          </b>
          <br/>
        </span>
      </Text>

      <ul role="list" className="mt-2 mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {[...Array(4).keys()].map((i) => {
          const r = metadata.properties.traits[`trait${i}`].value.rgb.r;
          const g = metadata.properties.traits[`trait${i}`].value.rgb.g;
          const b = metadata.properties.traits[`trait${i}`].value.rgb.b;
          const bg = `rgb(${r}, ${g}, ${b})`;
          return (<li key={i} className="col-span-1 flex flex-col rounded-md shadow-sm">
            <div style={{fontSize: 12}} className="-mb-2 flex flex-1 font-bold text-gray-400 items-center truncate">
              {traitNames[`trait${i}`].toUpperCase()}
            </div>
            <div className="flex flex-1 grow items-center justify-between truncate rounded-md border border-gray-200 bg-white">        
              <div className={
                  'flex-shrink-0 flex items-center justify-center text-white text-sm font-medium rounded-l-md'
                }
              >
                <span style={{
                  backgroundColor: bg,
                }} className="my-4 ml-1 rounded-md w-10 h-10"></span>
              </div>
              <div className="flex flex-1 items-center justify-between truncate bg-white">
                <div className="flex-1 truncate px-4 py-4 text-sm">
                  <Text 
                    color={TextColor.Gray700}
                    size={TextSize.SM}
                    className="font-bold">
                    {metadata.properties.traits[`trait${i}`].value.name}
                  </Text>
                  <Text className=""
                    color={TextColor.Gray400}
                    weight={TextWeight.Medium500}
                    size={TextSize.XS}>
                    {metadata.properties.traits[`trait${i}`].type[0] + metadata.properties.traits[`trait${i}`].type.toLowerCase().slice(1)}
                  </Text>
                </div>
              </div>
            </div>
          </li>
        )})}
      </ul>

      {!minted && (
        <Button size={ButtonSize.L} onClick={onClick}>
          Mint NFT
        </Button>
      )}

      {!isConnected && <Text
        className="mt-4 flex flex-row space-x-4 items-center"
        color={TextColor.Gray400}
        size={TextSize.SM}>
          **Please connect your wallet to mint your NFT**
      </Text> }

      {minted && <Text>Already minted</Text>}
    </>
  );
};

type OnboardMintSignProps = {
  onClick: () => void;
};

const OnboardMintSign = ({ onClick }: OnboardMintSignProps) => {
  return (
    <>
      <Text color={TextColor.Gray400} className="mb-10">
        Please confirm the transaction in your wallet or
      </Text>

      <Button size={ButtonSize.L} onClick={onClick}>
        Try Again
      </Button>
    </>
  );
};

const OnboardMintProc = () => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <Spinner color="gray" size="lg" />

        <Text color={TextColor.Gray400}>Minting, please wait</Text>
      </section>
    </>
  );
};

type OnboardMintErrorProps = {
  onClick: () => void;
};

const OnboardMintError = ({ onClick }: OnboardMintErrorProps) => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <HiXCircle color="#EF4444" />

        <Text color={TextColor.Gray400}>Something went wrong</Text>
      </section>

      <Button size={ButtonSize.L} onClick={onClick}>
        Try Again
      </Button>
    </>
  );
};

const OnboardMintSuccess = () => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <HiCheckCircle color="#10B981" />

        <Text color={TextColor.Gray400}>Minted successfully!</Text>
      </section>
    </>
  );
};

const OnboardMint = () => {
  const [screen, setScreen] = useState<
    "land" | "sign" | "proc" | "success" | "error"
  >("land");

  const { metadata, voucher, contractAddress, minted } = useLoaderData();

  const account = metadata?.properties?.metadata.account;
  const recipient = metadata?.properties?.metadata.account;
  const imgUrl = metadata?.image;

  const navigate = useNavigate();

  const { write, isError, isSuccess } = useContractWrite({
    // https://github.com/wagmi-dev/wagmi/issues/899
    // https://github.com/wagmi-dev/wagmi/issues/891
    // https://github.com/wagmi-dev/wagmi/discussions/880#discussioncomment-3516226
    mode: "recklesslyUnprepared",
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: "awardPFP",
    args: [recipient, voucher],
  });

  const submit = useSubmit();

  useEffect(() => {
    if (screen === "sign" && isError) {
      setScreen("error");
    } else if (screen === "sign" && isSuccess) {
      submit(
        {
          imgUrl,
          contractAddress,
        },
        {
          method: "post",
        }
      );

      setScreen("success");
    }
  }, [screen, isError, isSuccess]);

  const signMessage = () => {
    if (write) write();
  };

  let screenComponent = null;
  switch (screen) {
    case "sign":
      screenComponent = (
        <OnboardMintSign
          onClick={() => {
            setScreen("land");
          }}
        />
      );
      break;
    case "proc":
      screenComponent = <OnboardMintProc />;
      break;
    case "error":
      screenComponent = (
        <OnboardMintError
          onClick={() => {
            setScreen("land");
          }}
        />
      );
      break;
    case "success":
      screenComponent = <OnboardMintSuccess />;
      break;
    case "land":
    default:
      screenComponent = (
        <OnboardMintLand
          account={account}
          metadata={metadata}
          minted={minted}
          onClick={() => {
            setScreen("sign");
            signMessage();
          }}
        />
      );
  }

  return (
    <>
      <div className="flex justify-center items-center space-x-4 mb-10">
        <img src={prevStep} />
        <img src={currentStep} />
        <img src={nextStep} />
      </div>

      <Heading className="text-center">Congratulations!</Heading>

      <Text className="text-center" color={TextColor.Gray600}>
        We just mathematically generated this 1/1 gradient PFP & cover photo for
        you.
      </Text>

      <Text className="text-center" color={TextColor.Gray600}>
        You can mint this as NFT for FREE - you only pay the gas fee.
      </Text>

      <section
        id="onboard-mint-form"
        className="flex-1 flex flex-col justify-center items-center"
      >
        <div className="flex flew-row justify-center items-center mb-10">
          <img src={imgUrl} className="w-24 h-24"  style={{
            animation: "spCircRot 0.6s infinite linear",
        }}/>

          <Text className="mx-6">{"->"}</Text>

          <div
            className="w-24 h-24"
            style={{
              clipPath:
                "polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)",
              boxShadow: "inset 0px 10px 100px 10px white",
              transform: "scale(1.2)",
            }}
          >
            <img src={imgUrl} className="w-24 h-24" />
          </div>
        </div>

        {screenComponent}
      </section>

      <section
        id="onboard-ens-actions"
        className="flex justify-between lg:justify-end items-center space-x-4 pt-10 lg:pt-0"
      >
        {screen !== "sign" && screen !== "success" && (
          <>
            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.L}
              onClick={() => {
                // @ts-ignore
                navigate(`/onboard/nickname`);
              }}
            >
              Back
            </Button>

            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.L}
              onClick={() => {
                navigate("/onboard/ens");
              }}
            >
              Skip
            </Button>
          </>
        )}

        {screen === "success" && (
          <Button
            type={ButtonType.Primary}
            size={ButtonSize.L}
            onClick={() => {
              // Go back
              navigate("/onboard/ens");
            }}
          >
            Continue
          </Button>
        )}
      </section>
    </>
  );
};

export default OnboardMint;
