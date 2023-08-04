import { useState } from 'react'
import { Link, useFetcher } from '@remix-run/react'
import type { FetcherWithComponents } from '@remix-run/react'

import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import dangerVector from '../../images/danger.svg'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { RiLoader5Fill } from 'react-icons/ri'

import { HiOutlineX } from 'react-icons/hi'
export type DeleteAppModalProps = {
  appName: string
  appClientID: string
  appHasCustomDomain: boolean
  isOpen: boolean
  deleteAppCallback: (state: boolean) => unknown
}

export const DeleteAppModal = ({
  appName,
  appClientID,
  appHasCustomDomain,
  isOpen,
  deleteAppCallback,
}: DeleteAppModalProps) => {
  const fetcher = useFetcher()
  const [hasCustomDomain] = useState(Boolean(appHasCustomDomain))

  return (
    <Modal isOpen={isOpen} handleClose={() => deleteAppCallback(false)}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <div className="flex-1">
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Delete Application
            </Text>
            <button
              className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
              onClick={() => {
                deleteAppCallback(false)
              }}
              disabled={fetcher.state === 'submitting'}
            >
              <HiOutlineX />
            </button>
          </div>

          {hasCustomDomain && (
            <HasCustomDomain clientID={appClientID}></HasCustomDomain>
          )}
          {!hasCustomDomain && (
            <DeleteModalAppForm
              fetcher={fetcher}
              appName={appName}
              appClientID={appClientID}
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
  appClientID: string
  appName: string
  callback: (state: boolean) => unknown
}

const DeleteModalAppForm = ({
  fetcher,
  appClientID,
  appName,
  callback,
}: DeleteModalAppFormProps) => {
  const [isAppNameMatches, setAppNameMatches] = useState(false)
  return (
    <fetcher.Form method="post" action="/apps/delete" reloadDocument={true}>
      <section className="mb-4">
        <Text size="sm" weight="normal" className="text-gray-500 my-3">
          Are you sure you want to delete <b>{appName}</b> app? This action
          cannot be undone once confirmed.
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
          onChange={(e) => setAppNameMatches(appName === e?.target?.value)}
        />
      </section>
      <input type="hidden" name="clientId" value={appClientID} />

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
  clientID: string
}

const HasCustomDomain = ({ clientID }: HasCustomDomainProps) => (
  <section className="flex flex-col mb-4">
    <Text size="sm" weight="normal" className="text-gray-500 my-3">
      This application has a custom domain configured. You need to delete it
      before you can delete the application.
    </Text>

    <Link to={`/apps/${clientID}/domain`} className="self-end">
      <Button btnType="secondary-alt">Go to Custom Domain</Button>
    </Link>
  </section>
)
