import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { requireJWT } from '~/session.server'
import threeidIcon from '~/assets/3id-icon.svg'
import consoleIcon from '~/assets/console-icon.svg'
import { useLoaderData } from '@remix-run/react'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  // this will redirect unauthenticated users to the auth page but maintain query params
  await requireJWT(request)

  return json({
    THREEID_APP_URL,
    CONSOLE_APP_URL,
  })
}

export default function Apps() {
  const { THREEID_APP_URL, CONSOLE_APP_URL } = useLoaderData()
  const apps = [
    {
      name: 'My 3ID',
      description: 'Manage your 3ID',
      icon: threeidIcon,
      url: THREEID_APP_URL,
      disabled: false,
    },
    {
      name: 'Console',
      description: 'Manage your 3ID applications',
      icon: consoleIcon,
      url: CONSOLE_APP_URL,
      disabled: false,
    },
  ]
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        style={{
          backgroundImage: `url(https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/918fa1e6-d9c2-40d3-15cf-63131a2d8400/public)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className={'basis-2/5 h-screen w-full hidden lg:block'}
      ></div>
      <div className={'basis-full lg:basis-3/5'}>
        <div className={'flex flex-col mb-2'}>
          <h1
            className={
              'flex flex-row justify-center items-center text-lg font-semibold'
            }
          >
            Continue to
          </h1>
        </div>
        {apps.map(
          (
            app: {
              name: string
              description: string
              icon: string
              url: string
              disabled: boolean
            },
            key: number
          ) => {
            return (
              <div
                key={key}
                className={`flex flex-col gap-8`}
                style={app.disabled ? { opacity: 0.5 } : {}}
              >
                <div className={'flex flex-row justify-center items-center'}>
                  <a
                    href={!app.disabled ? app.url : '#'}
                    className={
                      'flex flex-col-2 w-[25vw] min-w-[18rem] justify-start items-start gap-4 my-2 p-2 bg-white'
                    }
                    style={{
                      border: '1px solid #D1D5DB',
                      boxSizing: 'border-box',
                      borderRadius: 8,
                    }}
                  >
                    <img src={app.icon} className={'w-12 h-12'} />
                    <div className={'flex flex-col justify-start items-start'}>
                      <div className={'text-xl font-semibold'}>{app.name}</div>
                      <div className={'text-sm'}>{app.description}</div>
                    </div>
                  </a>
                </div>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
