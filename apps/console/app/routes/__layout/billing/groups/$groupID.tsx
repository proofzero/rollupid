import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiOutlineCreditCard, HiOutlineMail } from 'react-icons/hi'
import {
  Link,
  NavLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Toaster, toast } from '@proofzero/design-system/src/atoms/toast'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { getEmailIcon } from '@proofzero/utils/getNormalisedConnectedAccounts'
import {
  Dropdown,
  type DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'
import { useHydrated } from 'remix-utils'
import _ from 'lodash'
import { process3DSecureCard } from '~/utils/billing'
import { IoWarningOutline } from 'react-icons/io5'
import { ToastWarning } from '@proofzero/design-system/src/atoms/toast/ToastWarning'
import plans from '../../../../utils/plans'
import { ServicePlanType } from '@proofzero/types/billing'
import { PlanCard } from '~/components/Billing'
import {
  LoaderData,
  loader as billingLoader,
  action as billingAction,
  TxTarget,
} from '../ops'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'
import { ListIdentityGroupsOutput } from '@proofzero/platform/identity/src/jsonrpc/methods/identity-groups/listIdentityGroups'
import { AppLoaderData } from '~/root'
import { GroupSeatingCard } from '~/components/Billing/seating'
import { useFeatureFlags } from '@proofzero/design-system/src/hooks/feature-flags'

export const loader = billingLoader
export const action = billingAction

export default () => {
  const loaderData = useLoaderData<LoaderData>()
  const actionData = useActionData()

  const {
    STRIPE_PUBLISHABLE_KEY,
    entitlements,
    toastNotification,
    paymentData,
    connectedEmails,
    invoices,
    groupURN,
    unpaidInvoiceURL,
    groupSeats,
  } = loaderData

  const { PASSPORT_URL, groups, apps } = useOutletContext<{
    PASSPORT_URL: string
    groups: ListIdentityGroupsOutput
    apps: AppLoaderData[]
  }>()

  const submit = useSubmit()
  const fetcher = useFetcher()

  useEffect(() => {
    // Checking status for 3DS payment authentication
    if (actionData?.status || fetcher.data?.status) {
      const { status, client_secret, payment_method, subId } = actionData
        ? actionData
        : fetcher.data

      process3DSecureCard({
        STRIPE_PUBLISHABLE_KEY,
        status,
        subId,
        client_secret,
        payment_method,
        submit,
        redirectUrl: `/billing/groups/${groupURN?.split('/')[1]}`,
        URN: groupURN,
      })
    }
  }, [actionData, fetcher.data])

  useEffect(() => {
    if (toastNotification) {
      toast(toastNotification.type, {
        message: toastNotification.message,
      })
    }
  }, [toastNotification])

  const redirectToPassport = () => {
    const currentURL = new URL(window.location.href)
    currentURL.search = ''

    const qp = new URLSearchParams()
    qp.append('scope', '')
    qp.append('state', 'skip')
    qp.append('client_id', 'console')

    qp.append('redirect_uri', currentURL.toString())
    qp.append('rollup_action', `groupemailconnect_${groupURN!.split('/')[1]}`)
    qp.append('login_hint', 'email')

    window.location.href = `${PASSPORT_URL}/authorize?${qp.toString()}`
  }

  useConnectResult()

  const [selectedEmail, setSelectedEmail] = useState<string | undefined>(
    paymentData?.email
  )
  const [selectedEmailURN, setSelectedEmailURN] = useState<string | undefined>(
    paymentData?.accountURN
  )
  const [fullName, setFullName] = useState<string | undefined>(
    paymentData?.name
  )

  const hydrated = useHydrated()
  const featureFlags = useFeatureFlags(hydrated)

  const [invoiceSort, setInvoiceSort] = useState<'asc' | 'desc'>('desc')

  const group = groups.find((g) => g.URN === groupURN)

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {unpaidInvoiceURL && (
        <section className="mb-6">
          <ToastWithLink
            message="We couldn't process payment for your account"
            linkHref={unpaidInvoiceURL}
            linkText="Update payment information"
            type={'urgent'}
          />
        </section>
      )}

      <section className="-mt-4">
        {group && (
          <Breadcrumbs
            trail={[
              {
                label: 'Billing & Invoicing',
                href: '/billing',
              },
              {
                label: group.name,
              },
            ]}
            LinkType={Link}
          />
        )}
      </section>

      <section className="flex flex-col lg:flex-row items-center justify-between mb-11">
        <div className="flex flex-row items-center space-x-3">
          <Text
            size="2xl"
            weight="semibold"
            className="text-gray-900 ml-2 lg:ml-0 "
          >
            Billing & Invoicing
          </Text>
        </div>
      </section>

      <section>
        {paymentData && !paymentData.paymentMethodID ? (
          <article className="mb-3.5">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment?URN=${groupURN}`}
              type={'warning'}
              linkText="Update payment information"
            />
          </article>
        ) : null}
        {!paymentData ? (
          <article className="mb-3.5">
            <ToastWarning message="Please fill Billing Contact Section" />
          </article>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <article className="bg-white rounded-lg border">
          <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
            <div>
              <div className="flex flex-row gap-4 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">
                  Billing Contact
                </Text>

                {!paymentData && <DangerPill text="Not Configured" />}
              </div>
              <Text size="sm" weight="medium" className="text-gray-500">
                This will be used to create a customer ID and for notifications
                about your billing
              </Text>
            </div>

            <Button
              btnType="primary-alt"
              btnSize="sm"
              disabled={
                !(fullName?.length && selectedEmail?.length) ||
                (paymentData?.name === fullName &&
                  paymentData?.email === selectedEmail)
              }
              onClick={() => {
                submit(
                  {
                    payload: JSON.stringify({
                      name: fullName,
                      email: selectedEmail,
                      accountURN: selectedEmailURN,
                      URN: groupURN,
                    }),
                  },
                  {
                    action: '/billing/details',
                    method: 'post',
                  }
                )
              }}
            >
              Submit
            </Button>
          </header>
          <main className="p-4 flex flex-row gap-4">
            <div className="w-52">
              <Input
                id="full_name"
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                }}
              />
            </div>

            <div className="w-80 flex flex-col justify-end">
              {connectedEmails && connectedEmails.length === 0 && (
                <Button
                  onClick={redirectToPassport}
                  btnType="secondary-alt"
                  className="py-[6px]"
                >
                  <div className="flex space-x-3">
                    <HiOutlineMail className="w-6 h-6 text-gray-800" />
                    <Text weight="medium" className="flex-1 text-gray-800">
                      Connect Email Address
                    </Text>
                  </div>
                </Button>
              )}

              {connectedEmails && connectedEmails.length > 0 && (
                <>
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-700 mb-2"
                  >
                    Email
                    <sup>*</sup>
                  </Text>

                  <Dropdown
                    items={(connectedEmails as DropdownSelectListItem[]).map(
                      (email) => {
                        email.value === ''
                          ? (email.selected = true)
                          : (email.selected = false)
                        // Substituting subtitle with icon
                        // on the client side
                        email.subtitle && !email.icon
                          ? (email.icon = getEmailIcon(email.subtitle))
                          : null
                        return {
                          value: email.value,
                          selected: email.selected,
                          icon: email.icon,
                          title: email.title,
                        }
                      }
                    )}
                    placeholder="Select an Email Address"
                    onSelect={(selected) => {
                      // type casting to DropdownSelectListItem instead of array
                      if (!Array.isArray(selected)) {
                        if (!selected || !selected.value) {
                          console.error('Error selecting email, try again')
                          return
                        }

                        setSelectedEmail(selected.title)
                        setSelectedEmailURN(selected.value)
                      }
                    }}
                    ConnectButtonCallback={redirectToPassport}
                    ConnectButtonPhrase="Connect New Email Address"
                    defaultItems={
                      connectedEmails.filter(
                        (ce) => ce.value === paymentData?.accountURN
                      ) as DropdownSelectListItem[]
                    }
                  />
                </>
              )}
            </div>
          </main>
        </article>

        <PlanCard
          plan={plans[ServicePlanType.PRO]}
          entitlements={entitlements[ServicePlanType.PRO]}
          paymentData={paymentData}
          submit={submit}
          apps={apps.filter((app) => app.groupID === groupURN?.split('/')[1])}
          fetcher={fetcher}
          hasUnpaidInvoices={Boolean(unpaidInvoiceURL)}
          newAppURL={`/groups/${groupURN?.split('/')[1]}/apps/new`}
        />

        {featureFlags['seats'] && groupURN && (
          <GroupSeatingCard
            groupID={groupURN.split('/')[1]}
            paymentData={paymentData}
            seatsTotal={groupSeats.total}
            seatsUsed={groupSeats.used}
            purchaseFn={(quantity) => {
              submit(
                {
                  payload: JSON.stringify({
                    quantity: groupSeats.total + quantity,
                    customerID: paymentData?.customerID,
                    txType: 'buy',
                    txTarget: TxTarget.GroupSeats,
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          />
        )}
      </section>

      <section className="mt-10">
        <article>
          <header className="flex flex-col lg:flex-row justify-between lg:items-center relative mb-6">
            <Text size="lg" weight="semibold" className="text-gray-900">
              Invoices & Payments
            </Text>

            <Link to={`/billing/portal?URN=${groupURN}`}>
              <Button
                btnType="secondary-alt"
                className="flex flex-row items-center gap-2"
              >
                <HiOutlineCreditCard />
                Update payment information
              </Button>
            </Link>
          </header>

          {invoices.length > 0 && (
            <>
              <main className="flex flex-row gap-4 items-center border rounded-lg">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 rounded-t-lg">
                    <tr className="rounded-t-lg">
                      <th className="px-6 py-3 text-left rounded-tl-lg">
                        <button
                          className="flex flex-row gap-2"
                          onClick={() => {
                            setInvoiceSort(
                              invoiceSort === 'desc' ? 'asc' : 'desc'
                            )
                          }}
                        >
                          <Text
                            size="xs"
                            weight="medium"
                            className="uppercase text-gray-500"
                          >
                            Date
                          </Text>

                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.00005 2.40002C8.21222 2.40002 8.41571 2.48431 8.56573 2.63434L10.9657 5.03434C11.2782 5.34676 11.2782 5.85329 10.9657 6.16571C10.6533 6.47813 10.1468 6.47813 9.83436 6.16571L8.00005 4.3314L6.16573 6.16571C5.85331 6.47813 5.34678 6.47813 5.03436 6.16571C4.72194 5.85329 4.72194 5.34676 5.03436 5.03434L7.43436 2.63434C7.58439 2.48431 7.78788 2.40002 8.00005 2.40002ZM5.03436 9.83434C5.34678 9.52192 5.85331 9.52192 6.16573 9.83434L8.00005 11.6687L9.83436 9.83434C10.1468 9.52192 10.6533 9.52192 10.9657 9.83434C11.2782 10.1468 11.2782 10.6533 10.9657 10.9657L8.56573 13.3657C8.25331 13.6781 7.74678 13.6781 7.43436 13.3657L5.03436 10.9657C4.72194 10.6533 4.72194 10.1468 5.03436 9.83434Z"
                              fill="#9CA3AF"
                            />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <Text
                          size="xs"
                          weight="medium"
                          className="uppercase text-gray-500"
                        >
                          Invoice total
                        </Text>
                      </th>
                      <th className="px-6 py-3 text-left rounded-tr-lg">
                        <Text
                          size="xs"
                          weight="medium"
                          className="uppercase text-gray-500"
                        >
                          Status
                        </Text>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="border-t border-gray-200">
                    {invoices
                      .sort((a, b) =>
                        invoiceSort === 'desc'
                          ? b.timestamp - a.timestamp
                          : a.timestamp - b.timestamp
                      )
                      .map((invoice, idx) => (
                        <tr
                          key={idx}
                          className={`${
                            idx === invoices.length - 1 ? '' : 'border-b'
                          } border-gray-200`}
                        >
                          <td className="px-6 py-3">
                            {hydrated && (
                              <div className="flex flex-row items-center space-x-3">
                                <Text size="sm" className="gray-500">
                                  {hydrated &&
                                    new Date(invoice.timestamp).toLocaleString(
                                      'default',
                                      {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      }
                                    )}
                                </Text>

                                {(invoice.status === 'open' ||
                                  invoice.status === 'uncollectible') && (
                                  <div
                                    className="rounded-xl bg-yellow-200 flex
                                flex-row items-center space-x-1 p-1"
                                  >
                                    <IoWarningOutline className="text-black w-4 h-4" />
                                    <Text size="xs" className="text-black">
                                      Payment Error
                                    </Text>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-3">
                            <Text size="sm" className="gray-500">
                              {invoice.amount < 0 ? '-' : ''}$
                              {invoice.amount < 0
                                ? (invoice.amount * -1).toFixed(2)
                                : invoice.amount.toFixed(2)}
                            </Text>
                          </td>

                          <td className="px-6 py-3">
                            <Text size="xs" className="test-gray-500">
                              {invoice.status && _.startCase(invoice.status)}
                            </Text>
                            {invoice.status === 'paid' && (
                              <a
                                href={invoice.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Text size="xs" className="text-indigo-500">
                                  View Invoice
                                </Text>
                              </a>
                            )}
                            {(invoice.status === 'open' ||
                              invoice.status === 'uncollectible') && (
                              <div className="flex flex-row space-x-2">
                                <a
                                  href={invoice.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Text size="xs" className="text-indigo-500">
                                    Update Payment
                                  </Text>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    submit(
                                      {
                                        invoice_id: invoice.id,
                                      },
                                      {
                                        method: 'post',
                                        action: 'billing/cancel',
                                      }
                                    )
                                  }}
                                >
                                  <Text size="xs" className="text-red-500">
                                    Cancel Payment
                                  </Text>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </main>
              <div className="w-full mt-2 text-end">
                <NavLink to={`/billing/portal?URN=${groupURN}`} target="_blank">
                  <Text size="sm" className="text-indigo-500 hover:underline">
                    View invoice history
                  </Text>
                </NavLink>
              </div>
            </>
          )}

          {invoices.length === 0 && (
            <main className="border rounded-lg bg-white flex flex-col justify-center items-center gap-9 py-14">
              <svg
                width="148"
                height="164"
                viewBox="0 0 148 164"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M74 155.893C114.869 155.893 148 122.762 148 81.8926C148 41.0235 114.869 7.89258 74 7.89258C33.1309 7.89258 0 41.0235 0 81.8926C0 122.762 33.1309 155.893 74 155.893Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M116.427 50.3193H31.574C28.8494 50.3193 26.6406 52.5281 26.6406 55.2527V158.853C26.6406 161.577 28.8494 163.786 31.574 163.786H116.427C119.152 163.786 121.361 161.577 121.361 158.853V55.2527C121.361 52.5281 119.152 50.3193 116.427 50.3193Z"
                  fill="white"
                />
                <path
                  d="M64.1348 65.1191H38.4815C36.8467 65.1191 35.5215 66.4444 35.5215 68.0791C35.5215 69.7139 36.8467 71.0391 38.4815 71.0391H64.1348C65.7696 71.0391 67.0948 69.7139 67.0948 68.0791C67.0948 66.4444 65.7696 65.1191 64.1348 65.1191Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 77.9453H38.4815C36.8467 77.9453 35.5215 79.2705 35.5215 80.9053C35.5215 82.5401 36.8467 83.8653 38.4815 83.8653H81.8948C83.5296 83.8653 84.8548 82.5401 84.8548 80.9053C84.8548 79.2705 83.5296 77.9453 81.8948 77.9453Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M64.1348 91.7598H38.4815C36.8467 91.7598 35.5215 93.085 35.5215 94.7198C35.5215 96.3545 36.8467 97.6798 38.4815 97.6798H64.1348C65.7696 97.6798 67.0948 96.3545 67.0948 94.7198C67.0948 93.085 65.7696 91.7598 64.1348 91.7598Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 104.586H38.4815C36.8467 104.586 35.5215 105.911 35.5215 107.546C35.5215 109.181 36.8467 110.506 38.4815 110.506H81.8948C83.5296 110.506 84.8548 109.181 84.8548 107.546C84.8548 105.911 83.5296 104.586 81.8948 104.586Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M64.1348 118.4H38.4815C36.8467 118.4 35.5215 119.726 35.5215 121.36C35.5215 122.995 36.8467 124.32 38.4815 124.32H64.1348C65.7696 124.32 67.0948 122.995 67.0948 121.36C67.0948 119.726 65.7696 118.4 64.1348 118.4Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 131.227H38.4815C36.8467 131.227 35.5215 132.552 35.5215 134.187C35.5215 135.821 36.8467 137.147 38.4815 137.147H81.8948C83.5296 137.147 84.8548 135.821 84.8548 134.187C84.8548 132.552 83.5296 131.227 81.8948 131.227Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M116.427 0H31.574C28.8494 0 26.6406 2.20873 26.6406 4.93333V34.5333C26.6406 37.2579 28.8494 39.4667 31.574 39.4667H116.427C119.152 39.4667 121.361 37.2579 121.361 34.5333V4.93333C121.361 2.20873 119.152 0 116.427 0Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M64.1329 10.8535H38.4795C36.8448 10.8535 35.5195 12.1788 35.5195 13.8135C35.5195 15.4483 36.8448 16.7735 38.4795 16.7735H64.1329C65.7676 16.7735 67.0929 15.4483 67.0929 13.8135C67.0929 12.1788 65.7676 10.8535 64.1329 10.8535Z"
                  fill="white"
                />
                <path
                  d="M81.8929 23.6797H38.4795C36.8448 23.6797 35.5195 25.0049 35.5195 26.6397C35.5195 28.2745 36.8448 29.5997 38.4795 29.5997H81.8929C83.5276 29.5997 84.8529 28.2745 84.8529 26.6397C84.8529 25.0049 83.5276 23.6797 81.8929 23.6797Z"
                  fill="white"
                />
              </svg>

              <Text>Your invoices will appear here</Text>
            </main>
          )}
        </article>
      </section>
    </>
  )
}
