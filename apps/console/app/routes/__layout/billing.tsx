import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { FaCheck, FaShoppingCart } from 'react-icons/fa'

export default () => {
  return (
    <>
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

        <div className="flex flex-row justify-end items-center gap-2 mt-2 lg:mt-0">
          <Text>Compare plans</Text>
        </div>
      </section>

      <section>
        <article className="bg-white rounded border">
          <header className="flex flex-row justify-between items-center pt-2.5 pb-4 pl-6 pr-4">
            <div>
              <Text size="lg" weight="semibold" className="text-gray-900">
                Pro Plan
              </Text>
              <Text size="sm" weight="medium" className="text-[#6B7280]">
                Everything in free & custom domain configuration, advanced
                support, whitelabeling and much more.
              </Text>
            </div>

            <div className="flex flex-row items-center py-2 px-3 gap-2.5 border border-gray-300 rounded">
              <FaShoppingCart className="text-gray-500" />
              <Text size="sm" className="text-gray-700">
                Purchase
              </Text>
            </div>
          </header>
          <div className="w-full border-b border-gray-200"></div>
          <main className="flex flex-row pt-4 pb-6 pl-6 pr-4 gap-7">
            <ul className="flex flex-col gap-3.5">
              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-indigo-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Unlimited MAUs
                </Text>
              </li>

              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-indigo-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Custom Branding
                </Text>
              </li>

              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-indigo-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Wallet Login
                </Text>
              </li>

              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-indigo-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Social Logins
                </Text>
              </li>
            </ul>

            <ul className="flex flex-col gap-3.5">
              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-green-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Profile API
                </Text>
              </li>

              <li className="flex flex-row items-center gap-3">
                <FaCheck className="text-green-500" />
                <Text size="sm" weight="medium" className="text-[#6B7280]">
                  Community Support
                </Text>
              </li>
            </ul>
          </main>
          <footer className="bg-gray-50 rounded-b py-4 px-6">
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
              <FaShoppingCart /> <Text>Purchase Entitlement(s)</Text>
            </div>
          </footer>
        </article>
      </section>
    </>
  )
}
