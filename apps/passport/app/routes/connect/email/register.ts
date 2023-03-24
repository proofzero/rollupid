import { ActionFunction, json, TypedResponse } from '@remix-run/cloudflare'
import { LoaderFunction } from 'react-router'
import { getAddressClient } from '~/platform.server'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { loader as otpLoader, action as otpAction } from './otp'

export const loader: LoaderFunction = async ({
  request,
  params,
  context,
}): Promise<
  | TypedResponse<{ state: any }>
  | TypedResponse<{ error: boolean; message: string }>
> => {
  try {
    const loaderRes = await otpLoader({ request, params, context })
    const { state } = await loaderRes.json()

    return json({ state })
  } catch (e) {
    const parsedException = await (e as Response).json()
    return json({
      error: true,
      message: parsedException as string,
    })
  }
}

export const action: ActionFunction = async (args) => {
  const actionRes = await otpAction(args)
  const { addressURN, successfulVerification } = await actionRes.json()

  if (successfulVerification) {
    const { request, context } = args

    const appData = await getConsoleParamsSession(request, context.env)
      .then((session) => JSON.parse(session.get('params')))
      .catch(() => null)

    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    const { accountURN, existing } = await addressClient.resolveAccount.query({
      jwt: await getJWTConditionallyFromSession(
        request,
        context.env,
        appData?.clientId
      ),
      force: !appData || appData.prompt !== 'login',
    })

    return authenticateAddress(
      addressURN,
      accountURN,
      appData,
      context.env,
      context.traceSpan,
      existing
    )
  }

  return json({ invalid: true })
}
