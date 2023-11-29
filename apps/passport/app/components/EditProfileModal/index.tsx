import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { AccountURN } from '@proofzero/urns/account'
import { FetcherWithComponents } from '@remix-run/react'
import { useEffect } from 'react'
import { TbInfoCircle } from 'react-icons/tb'
import IconPicker from '@proofzero/design-system/src/atoms/form/IconPicker'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { captureFormSubmitAndReplaceImages } from '~/utils/formCFImages.client'

const EditProfileModal: React.FC<{
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  profile: {
    picture: string
    name: string
    primaryAccountURN: AccountURN
    patched: boolean
  }
  fetcher: FetcherWithComponents<any>
}> = ({ isOpen, setIsOpen, profile, fetcher }) => {
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsOpen(false)
    }
  }, [fetcher])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} overflowAbsolute={true}>
      <div className="w-fit rounded-lg bg-white p-4 text-left transition-all sm:p-5 flex flex-col gap-4 max-w-[464px]">
        <section>
          <Text size="lg" weight="semibold">
            Passport Profile
          </Text>
        </section>

        <section className="flex flex-row justify-start items-center gap-2 bg-gray-100 rounded-lg p-4">
          <TbInfoCircle className="h-7 w-7 text-gray-500" />
          <Text size="sm" weight="normal" className="text-gray-500">
            Passport profile will be shared with applications that you authorize
            that request your public profile. <br /> Default values are set by
            your Primary Account.
          </Text>
        </section>

        <section>
          <fetcher.Form
            method="post"
            action="/settings/profile/patch"
            onSubmitCapture={(event) =>
              captureFormSubmitAndReplaceImages(event, fetcher.submit, () => {})
            }
          >
            <fieldset className="bg-gray-100 rounded-lg p-4 flex flex-col gap-4">
              <input
                type="hidden"
                name="primaryAccountURN"
                value={profile.primaryAccountURN}
              />

              <IconPicker
                label="Profile Picture"
                id="picture"
                setIsFormChanged={() => {}}
                setIsImgUploading={() => {}}
                url={profile.picture}
              />

              <Input
                label="Display Name"
                id="name"
                defaultValue={profile.name}
                required
              />
            </fieldset>

            <div className="flex flex-row items-center justify-between mt-4">
              <div>
                <Button
                  btnType="secondary-alt"
                  disabled={!profile.patched}
                  onClick={handleClose}
                >
                  Reset to Default
                </Button>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Button btnType="secondary-alt" onClick={handleClose}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  btnType="primary-alt"
                  disabled={fetcher.state !== 'idle'}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </fetcher.Form>
        </section>
      </div>
    </Modal>
  )
}

export default EditProfileModal
