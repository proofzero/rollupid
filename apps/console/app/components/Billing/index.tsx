import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { FaCheck, FaTrash } from 'react-icons/fa'
import {
  HiChevronDown,
  HiChevronUp,
  HiMinus,
  HiPlus,
  HiOutlineShoppingCart,
  HiArrowUp,
  HiOutlineX,
} from 'react-icons/hi'
import {
  type FetcherWithComponents,
  NavLink,
  useNavigate,
  type SubmitFunction,
} from '@remix-run/react'
import type { AppLoaderData } from '~/root'
import { Popover, Transition } from '@headlessui/react'
import { Listbox } from '@headlessui/react'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useState } from 'react'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { HiArrowNarrowRight } from 'react-icons/hi'
import _ from 'lodash'
import iSvg from '@proofzero/design-system/src/atoms/info/i.svg'
import { PaymentData, ServicePlanType } from '@proofzero/types/billing'
import { Spinner } from '@proofzero/packages/design-system/src/atoms/spinner/Spinner'
import plans, { PlanDetails } from '@proofzero/utils/billing/plans'

export const PlanFeatures = ({
  plan,
  featuresColor,
}: {
  plan: PlanDetails
  featuresColor: 'text-indigo-500' | 'text-gray-500'
}) => {
  return (
    <ul className="grid lg:grid-rows-4 grid-flow-row lg:grid-flow-col gap-4">
      {plan.features.map((feature) => (
        <li
          key={feature.title}
          className={`flex flex-row items-center gap-3 text-gray-500`}
        >
          <div className="w-3.5 h-3.5 flex justify-center items-center">
            {feature.type === 'current' && (
              <FaCheck className={featuresColor} />
            )}
            {feature.type === 'future' && (
              <TbHourglassHigh className={featuresColor} />
            )}
          </div>

          <Text size="sm" weight="medium">
            {feature.title}
          </Text>

          {feature.aggregateFeatures && (
            <Popover className="relative">
              <Popover.Button as="img" src={iSvg} className="cursor-pointer" />

              <Popover.Panel className="absolute z-10 bg-white p-2 border rounded-lg mt-2">
                <ul className="flex flex-col gap-2">
                  {feature.aggregateFeatures.map((af) => (
                    <li
                      key={af.title}
                      className={`flex flex-row items-center gap-3 text-gray-500`}
                    >
                      <div className="w-3.5 h-3.5 flex justify-center items-center">
                        {af.type === 'current' && (
                          <FaCheck className={'text-gray-500'} />
                        )}
                        {af.type === 'future' && (
                          <TbHourglassHigh className={'text-gray-500'} />
                        )}
                      </div>

                      <Text
                        size="sm"
                        weight="medium"
                        className="flex-1 text-left whitespace-nowrap"
                      >
                        {af.title}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Popover.Panel>
            </Popover>
          )}
        </li>
      ))}
    </ul>
  )
}

const PurchaseProModal = ({
  isOpen,
  setIsOpen,
  plan,
  entitlements,
  paymentData,
  submit,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  entitlements: number
  paymentData?: PaymentData
  submit: SubmitFunction
}) => {
  const [proEntitlementDelta, setProEntitlementDelta] = useState(1)

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div className="flex flex-row justify-between w-full pt-5 pb-3 px-5 items-center">
          <Text
            size="lg"
            weight="semibold"
            className="text-left text-gray-800 "
          >
            Purchase Entitlement(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        {!paymentData?.paymentMethodID ? (
          <section className="mx-5 mb-3">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment`}
              type={'warning'}
              linkText="Update payment information"
            />
          </section>
        ) : null}

        <section className="mx-5 mb-5 border rounded-lg overflow-auto thin-scrollbar">
          <div className="p-6">
            <Text
              size="lg"
              weight="semibold"
              className="text-gray-900 text-left"
            >
              {plan.title}
            </Text>

            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 text-left mb-6"
            >
              {plan.description}
            </Text>

            <PlanFeatures plan={plan} featuresColor="text-indigo-500" />
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <div>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Number of Entitlements
              </Text>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-500 text-left"
              >
                {proEntitlementDelta} x ${plan.price}/month
              </Text>
            </div>

            <div className="flex flex-row">
              <button
                type="button"
                className="flex justify-center items-center border
              disabled:cursor-not-allowed
              border-gray-300 bg-gray-50 rounded-l-lg px-4"
                onClick={() => {
                  setProEntitlementDelta((prev) => prev - 1)
                }}
                disabled={proEntitlementDelta <= 1}
              >
                <HiMinus />
              </button>

              <input
                type="text"
                className="border border-x-0 text-center w-[4rem] border-gray-300 focus:ring-0 focus:outline-0 focus:border-gray-300"
                readOnly
                value={proEntitlementDelta}
              />

              <button
                type="button"
                className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-r-lg px-4"
                onClick={() => {
                  setProEntitlementDelta((prev) => prev + 1)
                }}
              >
                <HiPlus />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <Text size="sm" weight="medium" className="text-gray-800 text-left">
              Changes to your subscription
            </Text>

            <div className="flex flex-row gap-2 items-center">
              <Text size="lg" weight="semibold" className="text-gray-900">{`+$${
                plan.price * proEntitlementDelta
              }`}</Text>
              <Text size="sm" weight="medium" className="text-gray-500">
                per month
              </Text>
            </div>
          </div>
        </section>

        <div className="flex-1"></div>

        <section className="flex flex-row-reverse gap-4 m-5 mt-auto">
          <Button
            btnType="primary-alt"
            disabled={!paymentData?.paymentMethodID}
            onClick={() => {
              setIsOpen(false)
              setProEntitlementDelta(1)
              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: entitlements + proEntitlementDelta,
                    customerID: paymentData?.customerID,
                    txType: 'buy',
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          >
            Purchase
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

const AssignEntitlementModal = ({
  isOpen,
  setIsOpen,
  entitlements,
  paymentData,
  entitlementUsage,
  fetcher,
  apps,
  newAppURL = '/apps/new',
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  entitlements: number
  entitlementUsage: number
  paymentData?: PaymentData
  fetcher: FetcherWithComponents<any>
  apps: AppLoaderData[]
  newAppURL?: string
}) => {
  const navigate = useNavigate()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div
          className="pb-2 pt-5 px-5
      flex flex-row items-start justify-between w-full"
        >
          <div className="flex flex-col items-start">
            <Text
              size="lg"
              weight="semibold"
              className="text-left text-gray-800"
            >
              Assign Entitlement(s)
            </Text>
            <Text className="text-left text-gray-500">
              {entitlementUsage} of {entitlements} Entitlements used
            </Text>
          </div>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>
        {!paymentData?.paymentMethodID ? (
          <section className="mx-5 mb-3">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment`}
              type={'warning'}
              linkText="Update payment information"
            />
          </section>
        ) : null}
        <div className="mb-5 w-full">
          <section className="border-t thin-scrollbar w-full my-4">
            <ul>
              {apps.map((app) => {
                return (
                  <li
                    key={app.clientId}
                    className="flex flex-row items-center justify-between
                py-1.5 border-b px-5"
                  >
                    <div className="flex flex-col items-start">
                      <Text>{app.name}</Text>
                      <Text className="text-gray-500">
                        {app.appPlan[0] + app.appPlan.slice(1).toLowerCase()}{' '}
                        Plan
                      </Text>
                    </div>
                    {app.appPlan === ServicePlanType.PRO ? (
                      <Button
                        btnType="secondary-alt"
                        onClick={() => {
                          navigate(`/apps/${app.clientId}/billing`)
                        }}
                      >
                        Manage
                      </Button>
                    ) : (
                      <>
                        {entitlementUsage < entitlements ? (
                          <Button
                            btnType="primary-alt"
                            className="flex flex-row items-center gap-3"
                            onClick={async () => {
                              setIsOpen(false)
                              fetcher.submit(
                                {
                                  op: 'update',
                                  payload: JSON.stringify({
                                    plan: ServicePlanType.PRO,
                                  }),
                                },
                                {
                                  method: 'post',
                                  action: `/apps/${app.clientId}/billing`,
                                }
                              )
                            }}
                          >
                            <HiArrowUp className="w-3.5 h-3.5" />{' '}
                            <Text>
                              Upgrade to{' '}
                              {ServicePlanType.PRO[0] +
                                ServicePlanType.PRO.slice(1).toLowerCase()}
                            </Text>
                          </Button>
                        ) : (
                          <Button
                            btnType="primary-alt"
                            className="flex flex-row items-center gap-3"
                            onClick={() => {
                              setIsOpen(false)
                              fetcher.submit(
                                {
                                  op: 'purchase',
                                  payload: JSON.stringify({
                                    plan: ServicePlanType.PRO,
                                  }),
                                },
                                {
                                  method: 'post',
                                  action: `/apps/${app.clientId}/billing`,
                                }
                              )
                            }}
                            disabled={!paymentData?.paymentMethodID}
                          >
                            <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                            <Text>Purchase Entitlement</Text>
                          </Button>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
          <section className=" px-5 w-full">
            <Button
              className="w-full"
              btnType="secondary-alt"
              onClick={() => {
                navigate(newAppURL)
              }}
            >
              Create New Application
            </Button>
          </section>
        </div>
      </div>
    </Modal>
  )
}

const RemoveEntitelmentModal = ({
  isOpen,
  setIsOpen,
  plan,
  entitlements,
  entitlementUsage,
  paymentData,
  submit,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  entitlements: number
  entitlementUsage: number
  paymentData?: PaymentData
  submit: SubmitFunction
}) => {
  const [proEntitlementNew, setProEntitlementNew] = useState(entitlementUsage)

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div className="pb-2 pt-5 px-5 w-full flex flex-row items-center justify-between">
          <Text size="lg" weight="semibold" className="text-left text-gray-800">
            Remove Entitlement(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>
        <section className="p-5 pt-auto w-full">
          <div className="w-full border rounded-lg overflow-auto thin-scrollbar">
            <div className="p-6">
              <Text
                size="lg"
                weight="semibold"
                className="text-gray-900 text-left"
              >
                {plan.title}
              </Text>
              <ul className="pl-4">
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You are currently using {entitlementUsage}/{entitlements}{' '}
                  {plan.title} entitlements
                </li>
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You can downgrade some of your applications if you'd like to
                  pay for fewer Entitlements.
                </li>
              </ul>
            </div>
            <div className="border-b border-gray-200"></div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-800 text-left"
                >
                  Number of Entitlements
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 text-left"
                >{`${entitlementUsage} x ${
                  plans[ServicePlanType.PRO].price
                }/month`}</Text>
              </div>

              <div className="flex flex-row text-gray-500 space-x-4">
                <div className="flex flex-row items-center space-x-2">
                  <Text size="sm">{entitlements} Entitlements</Text>
                  <HiArrowNarrowRight />
                </div>

                <div className="flex flex-row">
                  <Listbox
                    value={proEntitlementNew}
                    onChange={setProEntitlementNew}
                    disabled={entitlementUsage === entitlements}
                    as="div"
                  >
                    {({ open }) => {
                      return (
                        <div>
                          <Listbox.Button
                            className="relative w-full cursor-default border
                  py-1.5 px-4 text-left sm:text-sm rounded-lg
                  focus:border-indigo-500 focus:outline-none focus:ring-1
                  flex flex-row space-x-3 items-center"
                          >
                            <Text size="sm">{proEntitlementNew}</Text>
                            {open ? (
                              <HiChevronUp className="text-right" />
                            ) : (
                              <HiChevronDown className="text-right" />
                            )}
                          </Listbox.Button>
                          <Transition
                            show={open}
                            as="div"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="bg-gray-800"
                          >
                            <Listbox.Options
                              className="absolute no-scrollbar w-full bg-white
                        rounded-lg border max-h-[150px] max-w-[66.1833px] overflow-auto"
                            >
                              {Array.apply(null, Array(entitlements + 1)).map(
                                (_, i) => {
                                  return i >= entitlementUsage ? (
                                    <Listbox.Option
                                      key={i}
                                      value={i}
                                      className="flex items-center
                                cursor-pointer hover:bg-gray-100
                                rounded-lg m-1"
                                    >
                                      {({ selected }) => {
                                        return (
                                          <div
                                            className={`w-full h-full px-4 py-1.5
                                      rounded-lg ${
                                        selected
                                          ? 'bg-gray-100  font-medium'
                                          : ''
                                      }`}
                                          >
                                            {i}
                                          </div>
                                        )
                                      }}
                                    </Listbox.Option>
                                  ) : null
                                }
                              )}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      )
                    }}
                  </Listbox>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200"></div>

            <div className="p-6 flex justify-between items-center">
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Changes to your subscription
              </Text>

              <div className="flex flex-row gap-2 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">{`${
                  plan.price * (entitlements - proEntitlementNew) !== 0
                    ? '-'
                    : ''
                }$${plan.price * (entitlements - proEntitlementNew)}`}</Text>
                <Text size="sm" weight="medium" className="text-gray-500">
                  per month
                </Text>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-row-reverse gap-4 mt-auto m-5">
          <Button
            btnType="dangerous-alt"
            disabled={
              !paymentData?.paymentMethodID ||
              entitlementUsage === entitlements ||
              proEntitlementNew < entitlementUsage ||
              proEntitlementNew === entitlements
            }
            onClick={() => {
              setIsOpen(false)
              setProEntitlementNew(1)

              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: proEntitlementNew,
                    customerID: paymentData?.customerID,
                    txType: 'remove',
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          >
            Remove Entitlement(s)
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

const AssignedAppModal = ({
  apps,
  isOpen,
  setIsOpen,
}: {
  apps: AppLoaderData[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px]">
        <div className="w-full flex flex-row justify-between items-center pb-2 px-5 pt-5">
          <Text size="lg" weight="semibold" className="text-left text-gray-800">
            Assigned Application(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                        hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        <section>
          <ul>
            {apps.map((app) => (
              <li
                key={app.clientId}
                className="flex flex-row items-center justify-between
              p-5 border-t border-gray-200"
              >
                <div className="flex flex-col">
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-900 text-left"
                  >
                    {app.name}
                  </Text>
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 text-left"
                  >
                    {plans[app.appPlan].title}
                  </Text>
                </div>

                <NavLink to={`/apps/${app.clientId}/billing`}>
                  <Button btnType="secondary-alt">Manage</Button>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  )
}

export const PlanCard = ({
  plan,
  entitlements,
  apps,
  paymentData,
  submit,
  fetcher,
  hasUnpaidInvoices = false,
  newAppURL,
}: {
  plan: PlanDetails
  entitlements: number
  apps: AppLoaderData[]
  paymentData?: PaymentData
  hasUnpaidInvoices: boolean
  submit: SubmitFunction
  fetcher: FetcherWithComponents<any>
  newAppURL?: string
}) => {
  const [purchaseProModalOpen, setPurchaseProModalOpen] = useState(false)
  const [removeEntitlementModalOpen, setRemoveEntitlementModalOpen] =
    useState(false)
  const [assignedAppModalOpen, setAssignedAppModalOpen] = useState(false)
  const [assignEntitlementsModalOpen, setAssignEntitlementsModalOpen] =
    useState(false)

  const appsWithAssignedPlan = apps.filter(
    (a) => a.appPlan === ServicePlanType.PRO
  )
  return (
    <>
      <PurchaseProModal
        isOpen={purchaseProModalOpen}
        setIsOpen={setPurchaseProModalOpen}
        plan={plan}
        entitlements={entitlements}
        paymentData={paymentData}
        submit={submit}
      />
      <RemoveEntitelmentModal
        isOpen={removeEntitlementModalOpen}
        setIsOpen={setRemoveEntitlementModalOpen}
        plan={plan}
        entitlements={entitlements}
        entitlementUsage={appsWithAssignedPlan.length}
        paymentData={paymentData}
        submit={submit}
      />
      <AssignEntitlementModal
        isOpen={assignEntitlementsModalOpen}
        setIsOpen={setAssignEntitlementsModalOpen}
        entitlements={entitlements}
        entitlementUsage={appsWithAssignedPlan.length}
        paymentData={paymentData}
        fetcher={fetcher}
        apps={apps}
        newAppURL={newAppURL}
      />
      <AssignedAppModal
        isOpen={assignedAppModalOpen}
        setIsOpen={setAssignedAppModalOpen}
        apps={appsWithAssignedPlan}
      />
      <article className="bg-white rounded-lg border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
          <div>
            <Text size="lg" weight="semibold" className="text-gray-900">
              {plan.title}
            </Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              {plan.description}
            </Text>
          </div>

          <div className="flex flex-row items-center space-x-2">
            <Button
              btnType="secondary-alt"
              className={classnames(
                'flex flex-row items-center \
               gap-3',
                hasUnpaidInvoices
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => {
                setPurchaseProModalOpen(true)
              }}
              disabled={hasUnpaidInvoices}
            >
              <HiOutlineShoppingCart className="w-3.5 h-3.5" />

              <Text size="sm" weight="medium">
                Purchase
              </Text>
            </Button>
            <Button
              btnType="primary-alt"
              className={`
                  ${
                    hasUnpaidInvoices || fetcher.state !== 'idle'
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer '
                  }
                `}
              onClick={() => {
                setAssignEntitlementsModalOpen(true)
              }}
              disabled={hasUnpaidInvoices || fetcher.state !== 'idle'}
            >
              {fetcher.state === 'idle' ? (
                <Text size="sm" weight="medium" className="text-white">
                  Assign Entitlement(s)
                </Text>
              ) : (
                <Spinner />
              )}
            </Button>
          </div>
        </header>
        <div className="w-full border-b border-gray-200"></div>
        <main>
          <div className="flex flex-row gap-7 p-4">
            <PlanFeatures plan={plan} featuresColor="text-indigo-500" />
          </div>

          <div className="border-b border-gray-200"></div>

          {entitlements > 0 && (
            <div className="p-4">
              <div className="flex flex-row items-center gap-6">
                <div className="flex-1">
                  <Text size="sm" weight="medium" className="text-gray-900">
                    Entitlements
                  </Text>

                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (appsWithAssignedPlan.length / entitlements) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      {appsWithAssignedPlan.length > 0 && (
                        <button
                          type="button"
                          className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                          onClick={() => {
                            setAssignedAppModalOpen(true)
                          }}
                        >
                          <Text size="sm" weight="medium">
                            View Assigned Apps
                          </Text>
                        </button>
                      )}
                    </div>
                    <Text size="sm" weight="medium" className="text-gray-500">
                      {`${appsWithAssignedPlan.length} out of ${entitlements} Entitlements used`}
                    </Text>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Text size="lg" weight="semibold" className="text-gray-900">
                    ${entitlements * plans.PRO.price}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    per month
                  </Text>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer>
          {entitlements === 0 && (
            <div className="bg-gray-50 rounded-b-lg py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                onClick={() => {
                  setPurchaseProModalOpen(true)
                }}
              >
                <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                <Text size="sm" weight="medium">
                  Purchase Entitlement(s)
                </Text>
              </button>
            </div>
          )}
          {entitlements > appsWithAssignedPlan.length && (
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b-lg py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                onClick={() => {
                  setRemoveEntitlementModalOpen(true)
                }}
              >
                <FaTrash className="w-3.5 h-3.5" />
                <Text size="sm" weight="medium">
                  Remove Unused Entitlements
                </Text>
              </button>
            </div>
          )}
        </footer>
      </article>
    </>
  )
}
