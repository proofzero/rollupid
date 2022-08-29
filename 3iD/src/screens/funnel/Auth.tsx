import React, { useEffect, useState } from "react";

import { connect, forceAccounts } from "../../provider/web3";

import Layout from "../Layout";
import { Text, View } from "react-native";
import { getFunnelState, listInvitations } from "../../services/threeid";

import Spinner from "../../components/Spinner";

import {
  authenticate,
  getSDK,
  isAuthenticated,
  kbGetClaims,
} from "../../provider/kubelt";

export default function Auth({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { account } = route.params;
  const claimsRedirect = async (claim: string) => {
    const sdk = await getSDK();

    claim = claim.trim().toLowerCase();

    const funnelState = await getFunnelState(sdk);

    const claims = await kbGetClaims();
    if (claims.includes(claim)) {
      navigation.navigate("Onboard", { account });
    } else if (!funnelState.invite) {
      const invites = await listInvitations(sdk);
      if (invites.length > 0) {
        navigation.navigate("Invite", { account });
      } else {
        navigation.navigate("Gate", { account });
      }
    } else {
      navigation.navigate("Gate", { account });
    }
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        return claimsRedirect(claim);
      } else {
        const provider = await connect();

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          // debugger;

          return claimsRedirect(claim);
        } else {
          console.error("Unsuccesful authentication to Kubelt SDK");
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

  useEffect(() => {
    const asyncFn = async () => {
      await forceAccounts();
    };

    if (account === undefined) {
      asyncFn();
    }
  }, []);

  return (
    <Layout>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            paddingBottom: 22,
            fontFamily: "Inter_500Medium",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 28,
            color: "#1F2937",
            maxWidth: 758,
            textAlign: "center",
          }}
        >
          <>
            Checking if authenticated...
            <p
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 20,
                fontWeight: "500",
                color: "#1F2937",
                // backgroundColor: "white",
                // padding: "1em",
                // borderRadius: "0.5em",
              }}
            >
              You may have to sign a message. It could take a few seconds for
              the signing message to appear. If the does not appear try clicking
              on your wallet.
            </p>
            <Spinner />
          </>
        </Text>
      </View>
    </Layout>
  );
}
