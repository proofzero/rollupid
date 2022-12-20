import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Input } from '@kubelt/design-system/src/atoms/form/Input'
import { InputToggle } from '@kubelt/design-system/src/atoms/form/InputToggle'
import { PreLabeledInput } from '@kubelt/design-system/src/atoms/form/PreLabledInput'

type ApplicationAuthProps = {
  oAuth: {
    appId: string
    appSecret: string
    createdAt: Date
    onKeyRoll: () => void
  }
  onDelete: () => void
}

export const ApplicationAuth = ({ oAuth, onDelete }: ApplicationAuthProps) => (
  <section className="flex flex-col space-y-5">
    <Text size="2xl" weight="semibold" className="text-gray-900">
      0xAuth
    </Text>

    <div className="flex space-x-5">
      <div className="flex-1">
        <Panel title="API Keys">
          <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
            <div className="flex-1">
              <ReadOnlyInput
                id="oAuthAppId"
                label="Application ID"
                value={oAuth.appId}
              />
            </div>

            <div className="flex-1">
              <ReadOnlyInput
                id="oAuthAppSecret"
                label="Application Secret"
                value={oAuth.appSecret}
                hidden
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
                  onClick={oAuth.onKeyRoll}
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
            <InputToggle id="published" label="Published" />
          </div>
        </Panel>
      </div>
    </div>

    <Panel title="Details">
      <div className="flex flex-col md:space-y-5">
        <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
          <div className="flex-1">
            <Input id="appName" label="Application Name" required />
          </div>

          <div className="flex-1">
            <Input id="appScopes" label="Scopes" />
          </div>
        </div>

        <div className="my-8 md:my-0">
          <Input id="appDomains" label="Domain(s)" required />
        </div>

        <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
          <div className="flex-1">
            <PreLabeledInput
              id="appRedirectUrl"
              label="Redirect URL"
              preLabel="http://"
              placeholder="www.example.com"
            />
          </div>
          <div className="flex-1">
            <PreLabeledInput
              id="appTOSUrl"
              label="Terms of Service URL"
              preLabel="http://"
              placeholder="www.example.com"
            />
          </div>
          <div className="flex-1">
            <PreLabeledInput
              id="appWebsite"
              label="Website"
              preLabel="http://"
              placeholder="www.example.com"
            />
          </div>
        </div>
      </div>
    </Panel>

    <Panel title="Links">
      <div className="flex flex-col space-y-8 md:space-y-5">
        <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
          <div className="flex-1">
            <PreLabeledInput
              id="appWebsiteLink"
              label="Website"
              preLabel="https://"
            />
          </div>
          <div className="flex-1">
            <PreLabeledInput
              id="appTwitterLink"
              label="Twitter"
              preLabel="https://twitter.com/"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
          <div className="flex-1">
            <PreLabeledInput
              id="appMediumLink"
              label="Medium"
              preLabel="https://medium.com/@"
            />
          </div>
          <div className="flex-1">
            <PreLabeledInput
              id="appMirrorLink"
              label="Mirror"
              preLabel="https://mirror.xyz/"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
          <div className="flex-1">
            <PreLabeledInput
              id="appDiscordLink"
              label="Discord"
              preLabel="http://discord.com/"
            />
          </div>

          <div className="flex-1 hidden md:inline-flex">&nbsp;</div>
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
