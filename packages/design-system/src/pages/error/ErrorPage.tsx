import React from 'react'

import { Text } from '../../atoms/text/Text'
import { Pepe } from '../../atoms/pepe/Pepe'
import { ButtonAnchor } from '../../atoms/buttons/ButtonAnchor'

import { FaDiscord } from 'react-icons/fa'

export type ErrorPageProps = {
  code: string
  message: string
  trace?: string
}

export function ErrorPage({ code, message, trace }: ErrorPageProps) {
  return (
    <article className="relative m-4">
      <section
        className="absolute top-0 lg:top-1/3 right-0 xl:right-[15%]"
        style={{
          zIndex: -1,
        }}
      >
        <article className="w-60">
          <Pepe />
        </article>
      </section>

      <section className="flex flex-col justify-center items-center">
        <Text size="6xl" weight="extrabold" className="text-gray-800 mb-3">
          {code}
        </Text>
        <Text size="lg" className="text-gray-800">
          {message}
        </Text>
      </section>

      <section className="flex flex-col justify-center items-center mt-6">
        <ButtonAnchor btnSize="xxl" btnType="primary" href="/">
          Go back to homepage
        </ButtonAnchor>
        <Text className="my-3">or</Text>
        <ButtonAnchor
          btnSize="xxl"
          btnType="secondary"
          href="https://discord.gg/threeid"
          className="border-none"
        >
          <FaDiscord className="text-2xl" />
          <span className="text-gray-700">Join our Discord</span>
        </ButtonAnchor>
      </section>

      {trace && (
        <section className="flex flex-row justify-center mt-10">
          <div className="bg-white rounded w-full md:w-[36rem] mx-auto py-3 px-6">
            <Text weight="semibold" className="text-gray-800">
              Error message
            </Text>
            <Text size="sm" className="break-all leading-loose">
              {trace}
            </Text>
          </div>
        </section>
      )}
    </article>
  )
}
