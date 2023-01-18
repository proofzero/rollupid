import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

const SaveButton = ({ isFormChanged, discardFn, size = 'xl' }: any) => {
  return (
    <>
      {isFormChanged ? (
        <div className="flex lg:justify-end">
          <div className="pr-2">
            <Button
              type="reset"
              btnType={'secondary'}
              btnSize={size}
              className="!text-gray-600 border-none mb-4 lg:mb-0"
              onClick={discardFn}
            >
              Discard
            </Button>
          </div>
          <Button
            isSubmit
            btnType={'primary'}
            btnSize={size}
            className="mb-4 lg:mb-0"
          >
            Save
          </Button>
        </div>
      ) : (
        <div className="flex lg:justify-end">
          <Button
            isSubmit
            btnType={'primary'}
            btnSize={size}
            className="mb-4 lg:mb-0"
            disabled
          >
            Save
          </Button>
        </div>
      )}
    </>
  )
}

export default SaveButton
