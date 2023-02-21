import { useLoaderData } from '@remix-run/react'
import { loader as appLoader } from '~/routes/api/apps/index'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

export const loader = appLoader

export default () => {
  const { apps } = useLoaderData<{
    apps: {
      icon: string
      title: string
      timestamp: number
    }[]
  }>()

  return (
    <>
      <Text size="xl" weight="semibold" className="text-gray-800 mb-5">
        Applications
      </Text>

      <section className="flex flex-col space-y-4">
        {apps.map((a, i) => (
          <article
            key={i}
            className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg border"
          >
            <img src={a.icon} className="object-cover w-16 h-16 rounded" />

            <div className="flex-1">
              <Text weight="semibold" className="text-gray-900">
                {a.title}
              </Text>
            </div>

            <div className="text-right">
              <Button btnType="secondary-alt" className="bg-gray-100 mb-4">
                Edit Access
              </Button>

              <Text size="xs" weight="normal" className="text-gray-500">
                Approved:{' '}
                {new Date(a.timestamp).toLocaleString('default', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
