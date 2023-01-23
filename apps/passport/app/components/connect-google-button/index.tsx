import { Form } from '@remix-run/react'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import logoSvg from './logo.svg'

export default function ConnectGoogleButton() {
  return (
    <Form action={`/authenticate/google`} method="post">
      <Button
        className={'button'}
        btnType={'secondary-alt'}
        btnSize={'xxl'}
        isSubmit={true}
        style={{
          width: 328,
          height: 50,
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            height: 20,
            width: 20,
            margin: '0 7px',
          }}
        >
          <img src={logoSvg} alt="Google" />
        </span>{' '}
        Connect With Google
      </Button>
    </Form>
  )
}
