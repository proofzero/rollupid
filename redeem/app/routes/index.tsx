import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

import { 
  useAccount,
  useConnect
} from 'wagmi';

import Spinner from "~/components/spinner";
import MetamaskSVG from '~/components/metamask-svg';

type IndexProps = {
    inviteCode: string;
}

export default function Index({ inviteCode }: IndexProps) {
  // NOTE: state is all messed if we render this component with SSR
  if (typeof document === "undefined") {
      return null
  }

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, isConnected } = useAccount()

  let navigate = useNavigate();

  useEffect(() => {
      if (isConnected) {
          navigate(`/proof?address=${address}${inviteCode ? `&invite=${inviteCode}` : ''}`);
      }
  }, [isConnected])

  return (
    <div className="connectors justify-center items-center">
        <p className="auth-message">
            Connect Your Wallet
        </p>
        {isLoading || pendingConnector ? <Spinner /> :
        <div className='grid grid-rows-1 mt-2'>
            {connectors.map((connector) => (
                <div key={connector.id}>
                    <button className="connector"
                        disabled={!connector.ready}
                        key={connector.id}
                        onClick={() => connect({ connector })}
                        >
                        { connector.name.toLowerCase() == "metamask" ? <MetamaskSVG/> : null }
                        {connector.name}
                        {!connector.ready && ' (unsupported)'}
                        {isLoading &&
                            connector.id === pendingConnector?.id &&
                            ' (connecting)'}
                        </button>
                </div>
            ))}
            
            {error && <div className="text-center">{error.message}</div>}
            
        </div>}
        <div className="open-metamask-app">
            <a href={`https://metamask.app.link/dapp/dapp.threeid.xyz`}>
                Open in Metamask Mobile App
            </a>
        </div>
    </div>
  );
}
