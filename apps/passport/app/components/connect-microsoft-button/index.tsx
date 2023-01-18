import { Form } from '@remix-run/react'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import logoSvg from './microsoft-mark.svg'

export default function ConnectMicrosoftButton() {
  return (
    <Form action="/authenticate/microsoft" method="post">
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
          <img src={logoSvg} alt="Microsoft" />
        </span>{' '}
        Connect With Microsoft
      </Button>
    </Form>
  )
}
