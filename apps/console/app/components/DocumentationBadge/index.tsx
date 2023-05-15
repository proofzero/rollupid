import { HiOutlineBookOpen } from 'react-icons/hi'
import { Text } from '@proofzero/design-system'

export const DocumentationBadge = ({ url }: { url: string }) => {
  return (
    <div className="rounded-3xl bg-indigo-50 hover:bg-indigo-100">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex flex-row items-center text-indigo-700 py-1 px-2"
      >
        <HiOutlineBookOpen size={18} className="mr-1" />
        <Text size="xs">Documentation</Text>
      </a>
    </div>
  )
}