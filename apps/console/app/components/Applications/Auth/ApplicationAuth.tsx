import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Input } from '@kubelt/design-system/src/atoms/form/Input'
import { InputToggle } from '@kubelt/design-system/src/atoms/form/InputToggle'
import { MultiSelect } from '@kubelt/design-system/src/atoms/form/MultiSelect'
import { PreLabeledInput } from '@kubelt/design-system/src/atoms/form/PreLabledInput'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import IconPicker from '~/components/IconPicker'
import { useState } from 'react'
import { RotateCredsModal } from '~/components/RotateCredsModal/RotateCredsModal'
import type { ScopeMeta } from '@kubelt/platform/starbase/src/types'
import toast from 'react-hot-toast'

export type appDetailsProps = {
  app: {
    name: string
    scopes: string[]
    icon?: string
    redirectURI?: string
    termsURL?: string
    websiteURL?: string
    twitterUser?: string
    mediumUser?: string
    mirrorURL?: string
    discordUser?: string
  }
  published?: boolean
  clientId?: string
  secretTimestamp?: number
  apiKeyTimestamp?: number
}

export type errorsAuthProps = {
  websiteURL?: string
  termsURL?: string
  redirectURI?: string
}

type ApplicationAuthProps = {
  appDetails: appDetailsProps

  oAuth: {
    appId: string
    appSecret: string
    createdAt: Date
    onKeyRoll: () => void
  }
  scopeMeta: ScopeMeta
  onDelete: () => void
  setIsFormChanged?: (val: boolean) => void
  setIsImgUploading?: (val: boolean) => void
  isFormChanged?: boolean
  errors: errorsAuthProps
}

export const ApplicationAuth = ({
  appDetails,
  oAuth,
  scopeMeta,
  onDelete,
  isFormChanged,
  setIsImgUploading,
  setIsFormChanged,
  errors,
}: ApplicationAuthProps) => {
  const [rollKeyModalOpen, setRollKeyModalOpen] = useState(false)
  const [formData, setFormData] = useState<appDetailsProps>(appDetails)

  const scopeArray = Object.entries(scopeMeta).map(([key, value]) => {
    return {
      id: key,
      val: value.name,
      desc: value.description,
    }
  })

  return (
    <section className="flex flex-col space-y-5">
      <div className="flex flex-row justify-between space-x-5">
        <Text size="2xl" weight="semibold" className="text-gray-900">
          0xAuth
        </Text>
        <Button type="submit" btnType="primary-alt" disabled={!isFormChanged}>
          Save
        </Button>
      </div>

      <RotateCredsModal
        isOpen={rollKeyModalOpen}
        rotateCallback={() => {
          setRollKeyModalOpen(false)
          oAuth.onKeyRoll()
        }}
        closeCallback={() => setRollKeyModalOpen(false)}
      />

      <div className="flex flex-col md:flex-row space-y-5 lg:space-y-0 lg:space-x-5">
        <div className="flex-1">
          <Panel title="0xAuth Settings">
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
              <div className="flex-1">
                <ReadOnlyInput
                  id="oAuthAppId"
                  label="Application ID"
                  value={oAuth.appId}
                  disabled
                />
              </div>

              <div className="flex-1">
                <ReadOnlyInput
                  id="oAuthAppSecret"
                  label="Application Secret"
                  value={oAuth.appSecret ?? 's3cr3t-l337-h4x0r5'}
                  hidden={oAuth.appSecret ? false : true}
                  copyable={oAuth.appSecret ? true : false}
                  onCopy={() =>
                    toast.success('Client secret copied to clipboard!', {
                      duration: 2000,
                    })
                  }
                  disabled
                />
              </div>

              <div>
                <Text
                  size="xs"
                  weight="medium"
                  className="text-gray-400 text-right md:text-left"
                >
                  Created: {oAuth.createdAt.toDateString()}
                </Text>

                <div className="text-right">
                  <Text
                    type="span"
                    size="xs"
                    weight="medium"
                    className="text-indigo-500 cursor-pointer"
                    onClick={() => setRollKeyModalOpen(true)}
                  >
                    Roll keys
                  </Text>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Application Status">
            <div className="flex flex-col h-full justify-center">
              <InputToggle
                name="published"
                id="published"
                label="Published"
                onToggle={() => {
                  ;(setIsFormChanged as (val: boolean) => {})(true)
                }}
                checked={formData.published}
              />
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Details">
        <div className="flex flex-col md:space-y-5">
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
            <div className="flex-1">
              <Input
                id="name"
                label="Application Name"
                defaultValue={formData.app.name}
                required
              />
            </div>

            <div className="flex-1">
              <MultiSelect
                label="Scopes"
                // 3 - because 3 is default threeid scopes
                disabled={Object.keys(scopeMeta).length === 3}
                fieldName="scopes"
                items={Object.entries(scopeMeta).map(([key, value]) => {
                  return {
                    id: key,
                    val: value.name,
                    desc: value.description,
                  }
                })}
                selectedItems={appDetails.app.scopes?.map((scope) => {
                  const meta = scopeMeta[scope]
                  return {
                    id: scope,
                    val: meta.name,
                    desc: meta.description,
                  }
                })}
              />
            </div>
          </div>

          <div className="my-8 md:my-0">
            <ReadOnlyInput
              id="appDomains"
              label="Domain(s)"
              className="cursor-no-drop"
              value=""
              required
            />
            <Text
              type="span"
              size="xs"
              weight="medium"
              className="text-gray-400"
            >
              <a className="text-indigo-500" href="https://discord.gg/threeid">
                Contact us
              </a>{' '}
              to enable this feature
            </Text>
          </div>

          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
            <div className="flex-1">
              <Input
                id="redirectURI"
                label="Redirect URL"
                type="url"
                error={errors?.['redirectURI']}
                placeholder="www.example.com"
                defaultValue={formData.app.redirectURI}
              />
              {errors?.redirectURI ? (
                <Text
                  className="mb-1.5 mt-1.5 text-red-500"
                  size="xs"
                  weight="normal"
                >
                  {errors.redirectURI || ''}
                </Text>
              ) : (
                <div className="mb-[1.755rem]" />
              )}
            </div>

            <div className="flex-1">
              <Input
                id="termsURL"
                label="Terms of Service URL"
                type="url"
                error={errors?.['termsURL']}
                placeholder="www.example.com"
                defaultValue={formData.app.termsURL}
              />
              {errors?.termsURL ? (
                <Text
                  className="mb-1.5 mt-1.5 text-red-500"
                  size="xs"
                  weight="normal"
                >
                  {errors.termsURL || ''}
                </Text>
              ) : (
                <div className="mb-[1.755rem]" />
              )}
            </div>

            <div className="flex-1">
              <Input
                id="websiteURL"
                label="Website"
                error={errors?.['websiteURL']}
                type="url"
                placeholder="www.example.com"
                defaultValue={formData.app.websiteURL}
              />
              {errors?.websiteURL ? (
                <Text
                  className="mb-1.5 mt-1.5 text-red-500"
                  size="xs"
                  weight="normal"
                >
                  {errors.websiteURL || ''}
                </Text>
              ) : (
                <div className="mb-[1.755rem]" />
              )}
            </div>
          </div>

          <div>
            <IconPicker
              id="icon"
              setIsFormChanged={setIsFormChanged as (val: boolean) => void}
              setIsImgUploading={setIsImgUploading as (val: boolean) => void}
              url={formData.app.icon}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Links">
        <div className="flex flex-col space-y-8 md:space-y-5">
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
            <div className="flex-1">
              <PreLabeledInput
                id="discordUser"
                label="Discord"
                preLabel="http://discord.com/"
                defaultValue={formData.app.discordUser}
              />
            </div>
            <div className="flex-1">
              <PreLabeledInput
                id="twitterUser"
                label="Twitter"
                preLabel="https://twitter.com/"
                defaultValue={formData.app.twitterUser}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
            <div className="flex-1">
              <PreLabeledInput
                id="mediumUser"
                label="Medium"
                preLabel="https://medium.com/@"
                defaultValue={formData.app.mediumUser}
              />
            </div>
            <div className="flex-1">
              <PreLabeledInput
                id="mirrorURL"
                label="Mirror"
                preLabel="https://mirror.xyz/"
                defaultValue={formData.app.mirrorURL}
              />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Danger Zone">
        <Text
          type="span"
          weight="medium"
          size="sm"
          className="text-red-500 cursor-pointer"
          onClick={onDelete}
        >
          Delete the App
        </Text>
      </Panel>
    </section>
  )
}
