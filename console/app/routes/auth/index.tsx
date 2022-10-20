/**
 * @file app/routes/auth/index.tsx
 */

import {
    useAccount,
    useConnect
 } from "wagmi";

import { useEffect } from "react";
import { Link, useNavigate } from "@remix-run/react";

import Spinner from "~/shared/components/spinner";

// WalletOption
// -----------------------------------------------------------------------------

import metamask from "~/images/metamask.svg";
import walletconnect from "~/images/walletconnect.svg";
import torus from "~/images/torus.svg";
import bitski from "~/images/bitski.svg";
import coinbase from "~/images/coinbase.svg";
import formatic from "~/images/formatic.svg";
import authereum from "~/images/authereum.svg";
import wallet from "~/images/wallet.svg";

type WalletOptionProps = {
  // Taken from type declaration of WAGMI useConnect()
  connector: Connector<any, any, any>,
  onClick: Function,
};

function WalletOption({ connector, onClick }: WalletOptionProps) {
  const disabled = !connector.ready
  const disabledClass = disabled ? "grayscale select-none" : "";
  const disabledStyle = disabled ? { opacity: 0.6 } : {};

  const walletName = connector.name;

  let message = `Connect using ${connector.name}`;
  let walletIcon;

  switch(connector.name.toLowerCase()) {
  case "metamask":
    walletIcon = metamask;
    break;
  case "walletconnect":
    walletIcon = walletconnect;
    break;
  case "torus":
    walletIcon = torus;
    break;
  case "bitski":
    walletIcon = bitski;
    break;
  case "coinbase wallet":
    walletIcon = coinbase;
    break;
  case "formatic":
    walletIcon = formatic;
    break;
  case "authereum":
    walletIcon = authereum;
    break;
  default:
    message = "Connect using another wallet";
    walletIcon = wallet;
    break;
  }

  return (
    <div
      className={`flex-auto my-6 mx-6 text-center cursor-pointer ${disabledClass}`}
      style={disabledStyle}
      onClick={onClick}>
      <img className="inline-block mb-2" src={walletIcon} alt={`Icon for ${walletName}`} />
      <div className="text-2xl font-bold">{walletName}</div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
};

// WalletConnect
// -----------------------------------------------------------------------------

import { Connector, ConnectArgs } from "@wagmi/core";

type WalletConnectOptions = {
  // Taken from type declaration of WAGMI useConnect()
  connectors: Connector<any, any, any>[],
  // Taken from type declaration of WAGMI useConnect()
  connect: (args?: Partial<ConnectArgs> | undefined) => void,
};

function WalletConnect({ connectors, connect }: WalletConnectOptions) {
  const walletOptions = connectors.map((connector) => {
    const onClick = () => {
      connect({ connector });
    };
    return (
      <WalletOption key={connector.name} connector={connector} onClick={onClick} />
    );
  });

  return (
    <div className="grid grid-cols-1 m-12 shadow-xl place-items-center md:grid-flow-row-dense md:grid-cols-2">
      {walletOptions}
    </div>
  );
}

// Component
// -----------------------------------------------------------------------------
// To display an example grid of wallet auth providers:
//
// <div className="grid grid-cols-1 m-12 shadow-xl place-items-center md:grid-flow-row-dense md:grid-cols-2">
//   <WalletOption icon={metamask} name="Metamask">Connect to your MetaMask Wallet</WalletOption>
//   <WalletOption disabled={true} icon={walletconnect} name="WalletConnect">Scan with WalletConnect to connect</WalletOption>
//   <WalletOption disabled={true} icon={torus} name="Torus">Connect with your Torus Account</WalletOption>
//   <WalletOption disabled={true} icon={bitski} name="Bitski">Connect with your Bitski account</WalletOption>
//   <WalletOption disabled={true} icon={coinbase} name="Coinbase">Connect with your Coinbase account</WalletOption>
//   <WalletOption disabled={true} icon={formatic} name="Formatic">Connect with your Formatic account</WalletOption>
//   <WalletOption disabled={true} icon={authereum} name="Authereum">Connect with your Authereum account</WalletOption>
// </div>

// TODO implement the "unsupported" and "pending" state management
/*
<div key={connector.id}>
  <button
    className="connector"
    disabled={!connector.ready}
    key={connector.id}
    onClick={() => connect({ connector })}
    >
    { connector.name.toLowerCase() == "metamask" ? <MetamaskSVG/> : null }
    {connector.name}
    {!connector.ready && ' (unsupported)'}
    {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
  </button>
</div>
*/

export default function AuthIndex() {
  // NOTE: state is all messed if we render this component with SSR
  if (typeof document === "undefined") {
    return null;
  }

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount();

  let navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate(`/auth/sign/${address}`);
    }
  }, [isConnected]);

  return (
    <div className="flex flex-col items-center">
      <p className="auth-message text-kubelt-dark font-bold text-lg">
        Connect Your Wallet
      </p>
      {
        isLoading || pendingConnector ?
        <Spinner /> :
        <WalletConnect connectors={connectors} connect={connect} />
      }
      {error && <div className="text-center">{error.message}</div>}
      <div className="font-bold text-kubelt-dark">
        <a href={`https://metamask.app.link/dapp/dapp.threeid.xyz`}>
          Open in Metamask Mobile App
        </a>
      </div>
    </div>
  );
}
