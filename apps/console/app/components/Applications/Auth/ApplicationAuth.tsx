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

type appDetailsProps = {
  published: boolean
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
  setIsFormChanged: (val: boolean) => void
  onTogglePublished: (val: appDetailsProps) => void
  isFormChanged: boolean
}

export const ApplicationAuth = ({
  appDetails,
  oAuth,
  scopeMeta,
  onDelete,
  isFormChanged,
  onTogglePublished,
  setIsFormChanged,
}: ApplicationAuthProps) => {
  const [rollKeyModalOpen, setRollKeyModalOpen] = useState(false)
  const [formData, setFormData] = useState<appDetailsProps>(appDetails)

  console.log(formData)

  console.log({ appDetails, oAuth, scopeMeta, onDelete })

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
                onToggle={(state) => {
                  if (state) {
                    onTogglePublished({
                      published: true,
                      app: { ...formData.app },
                    })
                  }
                  setIsFormChanged(true)
                }}
                id="published"
                label="Published"
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
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      name: event.currentTarget.value,
                    },
                  })
                }}
                required
              />
            </div>

            <div className="flex-1">
              <MultiSelect
                label="Scopes"
                fieldName="scopes"
                items={Object.entries(scopeMeta).map(([key, value]) => {
                  return {
                    id: key,
                    val: value.name,
                    desc: value.description,
                  }
                })}
                selectedItems={appDetails.app.scopes.map((scope) => {
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
              <PreLabeledInput
                id="redirectURI"
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      redirectURI: event?.currentTarget.value,
                    },
                  })
                }}
                label="Redirect URL"
                preLabel="http://"
                placeholder="www.example.com"
                defaultValue={formData.app.redirectURI}
              />
            </div>
            <div className="flex-1">
              <PreLabeledInput
                id="termsURL"
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      termsURL: event?.currentTarget.value,
                    },
                  })
                }
                label="Terms of Service URL"
                preLabel="http://"
                placeholder="www.example.com"
                defaultValue={formData.app.termsURL}
              />
            </div>
            <div className="flex-1">
              <PreLabeledInput
                id="websiteURL"
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      websiteURL: event?.currentTarget.value,
                    },
                  })
                }}
                label="Website"
                preLabel="http://"
                placeholder="www.example.com"
                defaultValue={formData.app.websiteURL}
              />
            </div>
          </div>

          <div>
            <IconPicker id="icon" url={formData.app.icon} />
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
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      discordUser: event?.currentTarget.value,
                    },
                  })
                }
                defaultValue={formData.app.discordUser}
              />
            </div>
            <div className="flex-1">
              <PreLabeledInput
                id="twitterUser"
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      twitterUser: event?.currentTarget.value,
                    },
                  })
                }
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
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    app: {
                      ...formData.app,
                      mirrorURL: event?.currentTarget.value,
                    },
                  })
                }
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
