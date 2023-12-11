import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { AccountURN } from '@proofzero/urns/account'
import { FetcherWithComponents } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { TbInfoCircle } from 'react-icons/tb'
import IconPicker from '@proofzero/design-system/src/atoms/form/IconPicker'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { captureFormSubmitAndReplaceImages } from '@proofzero/design-system/src/utils/form-cf-images'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { HiOutlineUpload } from 'react-icons/hi'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'

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
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsOpen(false)

      if (!fetcher.data?.error) {
        toast(ToastType.Success, {
          message: fetcher.data.message,
        })
      } else if (fetcher.data?.error) {
        toast(ToastType.Error, {
          message: fetcher.data.message,
        })
      }
    }
  }, [fetcher])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {uploadingImage && <Loader />}
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
              Passport profile will be shared with applications that you
              authorize that request your public profile. <br /> Default values
              are set by your Primary Account.
            </Text>
          </section>

          <section>
            <fetcher.Form
              method="post"
              action="/settings/profile/patch"
              onSubmitCapture={(event) =>
                captureFormSubmitAndReplaceImages(
                  event,
                  fetcher.submit,
                  setUploadingImage
                )
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
                  previewStyle="round"
                  previewSize={47}
                  UploadElement={
                    <button
                      type="button"
                      className="bg-white rounded shadow-sm border border-gray-300 w-8 h-8 flex justify-center items-center"
                    >
                      <HiOutlineUpload />
                    </button>
                  }
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
                    disabled={
                      !profile.patched ||
                      fetcher.state !== 'idle' ||
                      uploadingImage
                    }
                    onClick={() =>
                      fetcher.submit(null, {
                        method: 'post',
                        action: '/settings/profile/reset',
                      })
                    }
                  >
                    Reset to Default
                  </Button>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Button
                    btnType="secondary-alt"
                    disabled={fetcher.state !== 'idle' || uploadingImage}
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    btnType="primary-alt"
                    disabled={fetcher.state !== 'idle' || uploadingImage}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </fetcher.Form>
          </section>
        </div>
      </Modal>
    </>
  )
}

export default EditProfileModal
