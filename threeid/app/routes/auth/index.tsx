// import styles from "./auth.css";

// export const links = () => [
//   { rel: "stylesheet", href: styles },
// ];

import { useConnect } from 'wagmi'
import { useEffect, useState } from "react";

import MetamaskSVG from '~/components/MetamaskSVG';

export default function AuthIndex() {
    // NOTE: state is all messed if we render this component with SSR
    if (typeof document === "undefined") {
        return null
    }

    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

    // useEffect(() => {
    //     console.log("isLoading", isLoading)
    // }, [isLoading])

    
    return (
        <div className="justify-center items-center">
            <p className="auth-message">
                Connect Your Wallet
            </p>
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
                
                {error && <div>{error.message}</div>}
                <div className="open-metamask-app">
                    <a href={`https://metamask.app.link/dapp/dapp.threeid.xyz`}>
                        Open in Metamask Mobile App
                    </a>
                </div>
            </div>
            
        </div>
    )
}
