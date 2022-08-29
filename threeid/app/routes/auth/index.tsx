import { 
    useAccount,
    useConnect
 } from 'wagmi'

import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

import Spinner from "~/components/Spinner";
import MetamaskSVG from '~/components/MetamaskSVG';

export default function AuthIndex() {
    // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const { address, isConnected } = useAccount()

    let navigate = useNavigate();

    useEffect(() => {
        if (isConnected) {
            navigate(`/auth/sign/${address}`);
        }
    }, [isConnected])

    return (
        <div className="connectors justify-center items-center">
            <p className="auth-message">
                Connect Your Wallet
            </p>
            {isLoading || pendingConnector ? <Spinner /> :
            <div>
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
    )
}
