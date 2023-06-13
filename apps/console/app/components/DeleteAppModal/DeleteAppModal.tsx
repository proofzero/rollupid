import { useState } from 'react'
import { Link, useFetcher } from '@remix-run/react'
import type { FetcherWithComponents } from '@remix-run/react'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import dangerVector from '../../images/danger.svg'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { RiLoader5Fill } from 'react-icons/ri'

import type { appDetailsProps } from '~/types'

export type DeleteAppModalProps = {
  appDetails: appDetailsProps
  isOpen: boolean
  deleteAppCallback: (state: boolean) => unknown
}

export const DeleteAppModal = ({
  appDetails,
  isOpen,
  deleteAppCallback,
}: DeleteAppModalProps) => {
  const fetcher = useFetcher()
  const [hasCustomDomain] = useState(Boolean(appDetails.customDomain))

  return (
    <Modal
      isOpen={isOpen}
      closable={fetcher.state !== 'submitting'}
      handleClose={() => deleteAppCallback(false)}
    >
      <div
        className={`w-[48vw] rounded-lg bg-white px-4 pb-4
         text-left  transition-all sm:px-6 sm:pb-6 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="text-gray-900 mb-2">
            Delete Application
          </Text>

          {hasCustomDomain && (
            <HasCustomDomain appDetails={appDetails}></HasCustomDomain>
          )}
          {!hasCustomDomain && (
            <DeleteModalAppForm
              fetcher={fetcher}
              appDetails={appDetails}
              callback={deleteAppCallback}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

type DeleteModalAppFormProps = {
  fetcher: FetcherWithComponents<any>
  appDetails: appDetailsProps
  callback: (state: boolean) => unknown
}

const DeleteModalAppForm = ({
  fetcher,
  appDetails,
  callback,
}: DeleteModalAppFormProps) => {
  const [isAppNameMatches, setAppNameMatches] = useState(false)
  return (
    <fetcher.Form method="post" action="/apps/delete" reloadDocument={true}>
      <section className="mb-4">
        <Text size="sm" weight="normal" className="text-gray-500 my-3">
          Are you sure you want to delete <b>{appDetails.app.name}</b> app? This
          action cannot be undone once confirmed.
        </Text>
        <Text size="sm" weight="normal" className="text-gray-500 my-3">
          Confirm you want to delete this application by typing its name below.
        </Text>
        <Input
          id="client_name"
          label="Application Name"
          placeholder="My application"
          required
          className="mb-12"
          onChange={(e) =>
            setAppNameMatches(appDetails.app.name === e?.target?.value)
          }
        />
      </section>
      <input type="hidden" name="clientId" value={appDetails.clientId} />

      <div className="flex justify-end items-center space-x-3">
        <Button
          btnType="secondary-alt"
          disabled={fetcher.state === 'submitting'}
          onClick={() => callback(false)}
        >
          Cancel
        </Button>
        <Button
          disabled={!isAppNameMatches || fetcher.state === 'submitting'}
          type="submit"
          btnType="dangerous"
          className={
            fetcher.state === 'submitting'
              ? 'flex items-center justify-between transition'
              : ''
          }
        >
          {fetcher.state === 'submitting' && (
            <RiLoader5Fill className="animate-spin" size={22} />
          )}
          Delete
        </Button>
      </div>
    </fetcher.Form>
  )
}

type HasCustomDomainProps = {
  appDetails: appDetailsProps
}

const HasCustomDomain = ({ appDetails }: HasCustomDomainProps) => (
  <section className="flex flex-col mb-4">
    <Text size="sm" weight="normal" className="text-gray-500 my-3">
      This application has a custom domain configured. You need to delete it
      before you can delete the application.
    </Text>

    <Link to={`/apps/${appDetails.clientId}/domain-wip`} className="self-end">
      <Button btnType="secondary-alt">Go to Custom Domain</Button>
    </Link>
  </section>
)
