import { Badge, Box, Card, Flex, Inline } from "@sanity/ui";
import React from "react";

import { requestWalletAuth, requestKubeltAuth } from "../domain/kubeltWallet";
import useAccount from "../hooks/useAccount";

function KubeltAuth() {
  const account = useAccount();
  const walletLogin = async () => {
    requestWalletAuth();
  };
  const kubeltLogin = async () => {
    const core = "foo";

    requestKubeltAuth(core);
  };

  return (
    <Card padding={2}>
      <Flex justify="space-between" align="center">
        <Inline space={2}>
          <Box>
            {!account && (
              <>
                <Badge mode="outline" tone="critical">
                  Wallet not linked
                </Badge>

                <button onClick={() => walletLogin()}>Connect</button>
              </>
            )}
            {account && (
              <Badge mode="outline" tone="positive">
                Wallet linked
              </Badge>
            )}
          </Box>
        </Inline>
      </Flex>

      <button onClick={() => kubeltLogin()}>KuAuth</button>
    </Card>
  );
}

export default KubeltAuth;
