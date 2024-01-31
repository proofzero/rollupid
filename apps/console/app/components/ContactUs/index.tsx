import { Button } from '@proofzero/design-system'
import { IdentityURN } from '@proofzero/urns/identity'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { useRef } from 'react'
import { PopupButton } from '@typeform/embed-react'

export default ({ urn, type }: { urn: IdentityURN; type: 'btn' | 'text' }) => {
  const ref = useRef<any>(null)
  const openPopup = () => ref.current?.open()

  return (
    <>
      <PopupButton
        id="V4FksPxe"
        ref={ref}
        hidden={{
          urn,
        }}
      >
        {null}
      </PopupButton>

      {type === 'btn' ? (
        <Button btnType="primary-alt" onClick={() => openPopup()}>
          Contact us for early access
        </Button>
      ) : (
        <Text size="sm" weight="semibold">
          <span className="text-gray-600">Any questions?</span>
          <button className="ml-1" onClick={() => openPopup()}>
            <span className="text-indigo-500">Contact us</span>
          </button>
        </Text>
      )}
    </>
  )
}
