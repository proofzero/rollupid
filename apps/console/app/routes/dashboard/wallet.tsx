/**
 * @file app/routes/dashboard/wallet.tsx
 */

import { Link } from "@remix-run/react";

import metamask from "../../images/metamask.svg";
import walletconnect from "../../images/walletconnect.svg";
import torus from "../../images/torus.svg";
import bitski from "../../images/bitski.svg";
import formatic from "../../images/formatic.svg";
import authereum from "../../images/authereum.svg";

// WalletOption
// -----------------------------------------------------------------------------

type WalletOptionProps = {
  icon: string,
  name: string,
  children: string,
  disabled?: boolean,
};

const WalletOption = (props: WalletOptionProps) => {
  const walletIcon = props.icon;
  const walletName = props.name;
  const disabled = (props?.disabled !== undefined) ? props.disabled : false;
  const disabledClass = disabled ? 'grayscale select-none' : '';
  const disabledStyle = disabled ? { opacity: 0.6 } : {};
  return (
    <div className={`flex-auto my-6 mx-6 text-center ${disabledClass}`} style={disabledStyle}>
      <img className="inline-block mb-2" src={walletIcon} alt={`Icon for ${walletName}`} />
      <div className="text-2xl font-bold">{walletName}</div>
      <p className="text-slate-400">{props.children}</p>
    </div>
  );
};

// Component
// -----------------------------------------------------------------------------

export default function WalletPage() {
  return (
    <div>
      <h3 className="text-2xl font-bold">Dashboard</h3>
      <div className="grid grid-cols-1 m-12 shadow-xl place-items-center md:grid-flow-row-dense md:grid-cols-2">
        <WalletOption icon={metamask} name="Metamask">Connect to your MetaMask Wallet</WalletOption>
        <WalletOption disabled={true} icon={walletconnect} name="WalletConnect">Scan with WalletConnect to connect</WalletOption>
        <WalletOption disabled={true} icon={torus} name="Torus">Connect with your Torus Account</WalletOption>
        <WalletOption disabled={true} icon={bitski} name="Bitski">Connect with your Bitski account</WalletOption>
        <WalletOption disabled={true} icon={formatic} name="Formatic">Connect with your Formatic account</WalletOption>
        <WalletOption disabled={true} icon={authereum} name="Authereum">Connect with your Authereum account</WalletOption>
      </div>
    </div>
  );
}
