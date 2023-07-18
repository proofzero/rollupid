import { Button } from '@proofzero/design-system'
import { AccountURN } from '@proofzero/urns/account'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export default ({ urn, type }: { urn: AccountURN; type: 'btn' | 'text' }) => {
  return type === 'btn' ? (
    <a
      href={`https://omq1ez0wxhd.typeform.com/to/V4FksPxe#urn=${urn}`}
      target="_blank"
    >
      <Button btnType="primary-alt">Contact us for early access</Button>
    </a>
  ) : (
    <Text size="sm" weight="semibold">
      <span className="text-gray-600">Any questions?</span>
      <span className="text-indigo-500 ml-1">
        <a
          href={`https://omq1ez0wxhd.typeform.com/to/V4FksPxe#urn=${urn}`}
          target="_blank"
        >
          Contact us
        </a>
      </span>
    </Text>
  )
}
