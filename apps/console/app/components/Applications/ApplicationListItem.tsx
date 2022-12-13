import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { HiDotsVertical } from 'react-icons/hi'

type ApplicationListItemPublishedStateProps = {
  published?: boolean
}
export const ApplicationListItemPublishedState = ({
  published,
}: ApplicationListItemPublishedStateProps) => (
  <span
    className={`rounded-full w-2 h-2 ${
      published ? 'bg-green-400' : 'bg-gray-300'
    }`}
  ></span>
)

type ApplicationListItemIconProps = {
  title: string
  iconUrl?: string
}
export const ApplicationListItemIcon = ({
  title,
  iconUrl,
}: ApplicationListItemIconProps) => (
  <div className="rounded-l w-16 h-14 flex justify-center items-center bg-gray-200 overflow-hidden">
    {!iconUrl && <Text className="text-gray-500">{title.substring(0, 1)}</Text>}
    {iconUrl && <img src={iconUrl} className="object-cover" />}
  </div>
)

type ApplicationListItemProps = {
  title: string
  created: Date
  iconUrl?: string
  published?: boolean
  panel?: React.ReactNode
}
export const ApplicationListItem = ({
  title,
  created,
  iconUrl,
  published,
  panel,
}: ApplicationListItemProps) => (
  <article className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white">
    <section>
      <ApplicationListItemIcon title={title} iconUrl={iconUrl} />
    </section>

    <section className="px-4 flex-1">
      <div className="flex flex-row space-x-2 items-center">
        <Text size="sm" weight="medium" className="text-gray-900">
          {title}
        </Text>
        <ApplicationListItemPublishedState published={published} />
      </div>

      <Text size="sm" weight="normal" className="text-gray-400">
        {created.toDateString()}
      </Text>
    </section>

    {panel && (
      <section className="p-1.5">
        <div className="w-8 h-8 flex justify-center items-center cursor-pointer">
          <HiDotsVertical className="text-lg text-gray-400" />
        </div>
      </section>
    )}
  </article>
)
