import {LockIcon} from '@sanity/icons'
import {Badge, Box, Button, Inline, Label, Stack, Text} from '@sanity/ui'
import React from 'react'

import {requestWalletAuth} from '../domain/kubeltWallet'
import useAccount from '../hooks/useAccount'

function AuthStep() {
  const account = useAccount()

  const requestLogin = async () => {
    requestWalletAuth()
  }

  return (
    <Box padding={2}>
      <Stack space={4}>
        <Text>Authentication</Text>
        {account && (
          <Stack space={2}>
            <Label>Signing as</Label>
            <Text>
              {`${account.substring(0, 6)}***${account.substring(
                account.length - 4,
                account.length
              )}`.toLocaleLowerCase()}
            </Text>
          </Stack>
        )}

        {!account && (
          <Stack space={2}>
            <Inline space={1}>
              <Badge padding={2} tone={'caution'}>
                Wallet not connected
              </Badge>
              {account && (
                <Badge padding={2} tone="caution">
                  Wallet might be locked
                </Badge>
              )}
            </Inline>

            <Box>
              <Button
                type="button"
                text="Connect"
                tone="positive"
                icon={LockIcon}
                onClick={() => requestLogin()}
              />
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default AuthStep
