import React from 'react'

import { Text } from '../../atoms/text/Text'
import { Pepe } from '../../atoms/pepe/Pepe'
import { ButtonAnchor } from '../../atoms/buttons/ButtonAnchor'
import { Button } from '../../atoms/buttons/Button'

import { FaDiscord } from 'react-icons/fa'
import JSONPretty from 'react-json-pretty'

export type ErrorPageProps = {
  code: string
  message: string
  trace?: string
  error?: {
    message: string
  }
}

export function ErrorPage({ code, message, trace, error }: ErrorPageProps) {
  const json = error?.message.replace('Unexpected error.: ', '')

  return (
    <article className="relative m-4">
      <section
        className="absolute top-0 hidden lg:block right-0 xl:right-[10%] 2xl:right-[22%]"
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
        <Button
          btnSize="xxl"
          btnType="primary"
          onClick={() =>
            window && document.referrer
              ? (window.location = document.referrer)
              : history.back()
          }
        >
          Go back
        </Button>
        <Text className="my-3">or</Text>
        <ButtonAnchor
          btnSize="xxl"
          btnType="secondary"
          href="https://discord.gg/rollupid"
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
            <Text
              size="sm"
              className="break-all leading-loose overflow-scroll max-h-80 text-xs p-4 bg-[#f3f4f6] shadow-inner rounded-md"
            >
              <JSONPretty
                id="json-pretty"
                data={json}
                style={{ background: 'none' }}
              ></JSONPretty>
            </Text>
          </div>
        </section>
      )}
    </article>
  )
}
