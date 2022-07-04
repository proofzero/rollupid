import React, { useEffect } from "react";

import { Pressable, Text, View } from "react-native";
import { startView } from "../analytics/datadog";
import useAccount from "../hooks/account";
import { connect, forceAccounts, isMetamask } from "../provider/web3";
import Layout from "./Layout";

export default function Landing({ navigation }: { navigation: any }) {
  const account = useAccount();
  const [hasMetamask, setHasMetamask] = React.useState(false);

  useEffect(() => {
    setHasMetamask(isMetamask());

    const asyncFn = async () => {
      await forceAccounts();
    };

    asyncFn();
  }, []);

  useEffect(() => {
    if (account) {
      navigation.navigate("Auth");
    }
  }, [account]);

  useEffect(() => {
    startView("landing");
  }, []);

  return (
    <Layout>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <Text
          style={{
            paddingTop: "1em",
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 28,
            color: "#1F2937",
          }}
        >
          Connect Your Wallet
        </Text>

        <Pressable
          style={{
            backgroundColor: "white",
            justifyContent: "center",
            marginTop: 57,
            padding: "1em",
            width: 460,
            maxWidth: "100%",
            height: 57,
            borderColor: "#D1D5DB",
            borderWidth: 1,
          }}
          onPress={() => connect()}
          disabled={!hasMetamask}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View>
              <svg
                width="32"
                height="29"
                viewBox="0 0 32 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.96143 26.2282L13.0632 27.3174V25.893L13.398 25.5579H15.7419V27.2336V28.4067H13.2306L10.1334 27.0661L8.96143 26.2282Z"
                  fill="#CDBDB2"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.355 26.2282L18.3369 27.3174V25.893L18.0021 25.5579H15.6582V27.2336V28.4067H18.1695L21.2668 27.0661L22.355 26.2282Z"
                  fill="#CDBDB2"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.3988 23.1279L13.064 25.893L13.4825 25.5578H17.8354L18.3377 25.893L18.0028 23.1279L17.3332 22.709L13.9848 22.7928L13.3988 23.1279Z"
                  fill="#393939"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.1382 4.44312L13.1472 9.13529L14.068 22.7929H17.3327L18.3372 9.13529L20.1788 4.44312H11.1382Z"
                  fill="#F89C35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.34876 14.749L0.00488281 21.5359L5.86457 21.2008H9.63151V18.2681L9.46409 12.2354L8.62699 12.9057L2.34876 14.749Z"
                  fill="#F89D35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.78564 15.5031L13.6499 15.6706L12.8965 19.1898L9.63178 18.3519L6.78564 15.5031Z"
                  fill="#D87C30"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.78564 15.5869L9.63178 18.2682V20.9494L6.78564 15.5869Z"
                  fill="#EA8D3A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.63135 18.3519L12.9797 19.1898L14.068 22.7927L13.3146 23.2117L9.63135 21.0332V18.3519Z"
                  fill="#F89D35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.63111 21.0332L8.96143 26.2281L13.3981 23.1279L9.63111 21.0332Z"
                  fill="#EB8F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.6491 15.6708L14.0677 22.7928L12.812 19.148L13.6491 15.6708Z"
                  fill="#EA8E3A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.78125 21.117L9.6319 21.0332L8.96222 26.2281L5.78125 21.117Z"
                  fill="#D87C30"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.8465 28.4905L8.96183 26.2282L5.78086 21.1171L0.00488281 21.536L1.8465 28.4905Z"
                  fill="#EB8F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.1476 9.13513L9.54807 12.1515L6.78564 15.5031L13.6499 15.7545L13.1476 9.13513Z"
                  fill="#E8821E"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.96143 26.2281L13.3981 23.1279L13.0632 25.8092V27.3174L10.0497 26.7309L8.96143 26.2281Z"
                  fill="#DFCEC3"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.355 26.2281L18.0021 23.1279L18.3369 25.8092V27.3174L21.3505 26.7309L22.355 26.2281Z"
                  fill="#DFCEC3"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.8082 17.1788L12.729 19.106L9.46433 18.2681L11.8082 17.1788Z"
                  fill="#393939"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.7627 0.504883L13.1472 9.13513L11.2219 4.44296L1.7627 0.504883Z"
                  fill="#E88F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.76264 0.504883L0.255859 5.11327L1.09296 10.1406L0.506989 10.4758L1.34409 11.2299L0.674408 11.8164L1.59522 12.6543L1.00925 13.157L2.3486 14.8328L8.62684 12.9056C11.6962 10.4478 13.203 9.19099 13.1472 9.13513C13.0914 9.07927 9.29652 6.20252 1.76264 0.504883Z"
                  fill="#8E5A30"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M28.9686 14.749L31.3125 21.5359L25.4528 21.2008H21.6859V18.2681L21.8533 12.2354L22.6904 12.9057L28.9686 14.749Z"
                  fill="#F89D35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.5317 15.5031L17.6675 15.6706L18.4209 19.1898L21.6856 18.3519L24.5317 15.5031Z"
                  fill="#D87C30"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.5317 15.5869L21.6856 18.2682V20.9494L24.5317 15.5869Z"
                  fill="#EA8D3A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.6855 18.3519L18.3372 19.1898L17.2489 22.7927L18.0023 23.2117L21.6855 21.0332V18.3519Z"
                  fill="#F89D35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.6853 21.0332L22.355 26.2281L18.0021 23.2117L21.6853 21.0332Z"
                  fill="#EB8F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.6673 15.6708L17.2488 22.7928L18.5044 19.148L17.6673 15.6708Z"
                  fill="#EA8E3A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M25.5361 21.117L21.6855 21.0332L22.3552 26.2281L25.5361 21.117Z"
                  fill="#D87C30"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M29.4709 28.4905L22.3555 26.2282L25.5365 21.1171L31.3125 21.536L29.4709 28.4905Z"
                  fill="#EB8F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.1698 9.13513L21.7693 12.1515L24.5317 15.5031L17.6675 15.7545L18.1698 9.13513Z"
                  fill="#E8821E"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.5092 17.1788L18.5884 19.106L21.8531 18.2681L19.5092 17.1788Z"
                  fill="#393939"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M29.5542 0.504883L18.1697 9.13513L20.095 4.44296L29.5542 0.504883Z"
                  fill="#E88F35"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M29.5543 0.504883L31.061 5.11327L30.2239 10.1406L30.8099 10.4758L29.9728 11.2299L30.6425 11.8164L29.7217 12.6543L30.3076 13.157L28.9683 14.8328L22.6901 12.9056C19.6207 10.4478 18.1139 9.19099 18.1697 9.13513C18.2255 9.07927 22.0204 6.20252 29.5543 0.504883Z"
                  fill="#8E5A30"
                />
              </svg>
            </View>

            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                fontWeight: "600",
                lineHeight: 21.78,
                color: "#000000",
                marginLeft: "1em",
                flex: 1,
              }}
            >
              Metamask
            </Text>

            <View>
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.3125 18.5L15.3125 12.5L9.3125 6.5"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </View>
          </View>
        </Pressable>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            fontWeight: "400",
            lineHeight: 19.36,
            color: "#B6B6C8",
            marginTop: 25,
          }}
        >
          We are going to support more wallets soon!
        </Text>
      </View>
    </Layout>
  );
}
