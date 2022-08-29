import React, { useEffect, useState } from "react";

import { View, Text, Image, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Layout from "../Layout";

import { forceAccounts } from "../../provider/web3";
import { getSDK, isAuthenticated, kbGetClaims } from "../../provider/kubelt";

import {
  claimInvitation,
  listInvitations,
  tickFunnelStep,
} from "../../services/threeid";
import { Invitation } from "../../services/threeid/types";

const gatewayFromIpfs = (ipfsUrl: string | undefined): string | undefined => {
  const regex = /(bafy\w*)/;
  const matches = regex.exec(ipfsUrl as string);

  if (!matches || !ipfsUrl) return undefined;

  const itemPath = ipfsUrl?.split(matches[0])[1];
  const resourceUrl = `https://nftstorage.link/ipfs/${matches[0]}/${itemPath}`;

  return resourceUrl;
};

export default function Invite({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const [availableInvites, setAvailableInvites] = useState<Invitation[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<Invitation>();

  const { account } = route.params;

  const continueToThreeId = async () => {
    const sdk = await getSDK();

    await tickFunnelStep(sdk, "invite");

    navigation.navigate("Onboard", { account });
  };

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (claims.includes(claim)) {
      return continueToThreeId();
    }
  };

  const claimInvite = async () => {
    const sdk = await getSDK();

    if (!selectedInvite) {
      throw new Error("This should never be the case");
    }

    const { contractAddress, tokenId } = selectedInvite;

    const usedInvite = await claimInvitation(sdk, contractAddress, tokenId);

    if (usedInvite) {
      return continueToThreeId();
    }
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const sdk = await getSDK();
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        claimsRedirect(claim);

        const invites = await listInvitations(sdk);
        if (invites && invites.length > 0) {
          setAvailableInvites(invites);
          setSelectedInvite(invites[0]);
        } else {
          navigation.navigate("Gate", { account });
        }
      } else {
        navigation.navigate("Gate", { account });
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
            fontFamily: "Inter_500Medium",
            fontSize: 36,
            fontWeight: "500",
            lineHeight: 40,
            color: "#1F2937",
          }}
        >
          We've detected a 3ID invite!
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 24,
            fontWeight: "400",
            lineHeight: 32,
            color: "#1F2937",
          }}
        >
          You can now login to 3ID anytime.
        </Text>

        {selectedInvite && (
          <Image
            style={{
              width: 264,
              height: 197,
              marginTop: 43,
              marginBottom: 23,
            }}
            source={{
              uri: gatewayFromIpfs(selectedInvite.image),
            }}
          />
        )}

        {!selectedInvite && (
          <View
            style={{
              width: 264,
              height: 197,
              marginTop: 43,
              marginBottom: 23,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: 24,
                height: 24,
              }}
              source={require("../../assets/loading.png")}
            />
          </View>
        )}

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 18,
            fontWeight: "400",
            lineHeight: 32,
            color: "#9CA3AF",
            marginBottom: 50,
          }}
        >
          Feel free to transfer or trade your invite card on secondary markets.
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {availableInvites.length > 1 && (
            <View
              style={{
                marginRight: 5,
                borderColor: "#9CA3AF",
                borderWidth: 1,
              }}
            >
              <Picker
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderColor: "transparent",
                  borderRightColor: "transparent",
                  borderRightWidth: 10,
                }}
                selectedValue={selectedInvite?.tokenId}
                onValueChange={(_, itemIndex) => {
                  setSelectedInvite(availableInvites[itemIndex]);
                }}
              >
                {availableInvites.map((invite) => (
                  <Picker.Item
                    key={invite.tokenId}
                    label={invite.title}
                    value={invite.tokenId}
                  />
                ))}
              </Picker>
            </View>
          )}

          <Pressable
            onPress={() => claimInvite()}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 22,
              paddingVertical: 14,
              backgroundColor: "#192030",
              maxWidth: "100%",
              height: 48,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                testID="invite-continue-to-3id"
                style={{
                  fontFamily: "Manrope_700Bold",
                  fontSize: 16,
                  fontWeight: "700",
                  lineHeight: 22,
                  color: "white",
                  marginRight: 10,
                }}
              >
                Continue to 3ID
              </Text>

              <Image
                style={{
                  width: 24,
                  height: 24,
                }}
                source={require("../../assets/arrow_right_white.png")}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}
