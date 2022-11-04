import { useEffect } from "react";
import { useNavigate, useTransition } from "@remix-run/react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import { useAccount, useConnect } from "wagmi";

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import Spinner from "~/components/spinner";
import MetamaskSVG from "~/components/metamask-svg";

import colorCard from "~/assets/Card_Color.png";
import profileGraphic from "~/assets/Profile_Graphic.png";

type IndexProps = {
  inviteCode: string;
};

export default function Index({ inviteCode }: IndexProps) {
  const [open, setOpen] = useState(false);
  const [nextStep, setNextStep] = useState("");

  const transition = useTransition();
  // NOTE: state is all messed if we render this component with SSR
  if (typeof document === "undefined") {
    return null;
  }

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address, isConnected } = useAccount();

  let navigate = useNavigate();

  useEffect(() => {
    console.log("nextStep", nextStep);
    if (isConnected && nextStep) {
      console.log("redirecting with invite code", inviteCode);
      navigate(
        `${nextStep}?address=${address}${
          inviteCode ? `&invite=${inviteCode}` : ""
        }`
      );
    } else {
      setOpen(false);
    }
  }, [isConnected, nextStep]);

  return (
    <div className="connectors justify-center items-center">
      <div className="align-self-center">
        <div className="col-12 mx-auto text-center">
          <Text size={TextSize.XL3} weight={TextWeight.SemiBold600}>
            Welcome to the 3ID Early Access Program! 🎉
          </Text>
        </div>
      </div>

      <div className="align-self-center">
        <div className="col-12 mx-auto mt-4 mb-8 text-center">
          <Text size={TextSize.XL} weight={TextWeight.Regular400}>
            From here you can:
          </Text>
        </div>
      </div>

      <div className="flex flex-row lg:flex-nowrap flex-wrap">
        <div className="bg-white shadow sm:rounded-lg m-4 lg:basis-1/2 max-w-full">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Claim your 3ID Account
            </h3>
            <div className="my-4 max-w-xl text-sm text-gray-500">
              <p>Sign and share a proof to register your 3ID account.</p>
            </div>
            <div className="py-4 m-auto text-center">
              <img
                style={{ maxWidth: "28em", margin: "auto" }}
                src={profileGraphic}
              />
            </div>
            <div className="mt-8">
              <button
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  padding: "0.5em 0em",
                  textDecoration: "none",
                  fontSize: "1em",
                  margin: "auto",
                }}
                className="action-button"
                onClick={() => {
                  setNextStep("/claim/proof");
                  setOpen(true);
                }}
              >
                Submit a Proof
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg m-4 lg:basis-1/2 max-w-full">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Mint a limited 3ID Access Card
            </h3>
            <div className="my-4 max-w-xl text-sm text-gray-500">
              <p>
                Get priority access to 3ID features and services. You can also
                be eligible for airdrops and other rewards.
              </p>
            </div>
            <div className="-mt-6 m-auto text-center">
              <img
                style={{ maxWidth: "21em", margin: "auto" }}
                src={colorCard}
              />
            </div>
            <div className="mt-8">
              <button
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  padding: "0.5em 0em",
                  textDecoration: "none",
                  fontSize: "1em",
                  margin: "auto",
                }}
                className="action-button"
                onClick={() => {
                  setNextStep("/mint/redeem");
                  setOpen(true);
                }}
              >
                Mint 3ID Access Card
              </button>
            </div>
          </div>
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                  <div
                    className="align-self-center"
                    style={{
                      marginBottom: "2em",
                    }}
                  >
                    <div className="mx-auto text-center"></div>
                  </div>
                  <p className="auth-secondary-message">
                    Connect Your Wallet to Continue:
                  </p>
                  {isLoading ||
                  pendingConnector ||
                  transition.state === "loading" ? (
                    <Spinner />
                  ) : (
                    <div className="grid grid-rows-1 mt-2 mx-4">
                      {connectors.map((connector) => (
                        <div key={connector.id}>
                          <button
                            className="connector"
                            disabled={!connector.ready}
                            key={connector.id}
                            onClick={() => connect({ connector })}
                          >
                            {connector.name.toLowerCase() == "metamask" ? (
                              <MetamaskSVG />
                            ) : null}
                            {connector.name}
                            {!connector.ready && " (unsupported)"}
                            {isLoading &&
                              connector.id === pendingConnector?.id &&
                              " (connecting)"}
                          </button>
                        </div>
                      ))}

                      {error && (
                        <div className="text-center">{error.message}</div>
                      )}
                    </div>
                  )}
                  <div className="open-metamask-app">
                    <a href={`https://metamask.app.link/dapp/3id.kubelt.com`}>
                      Open in Metamask Mobile App
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
