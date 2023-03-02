import React from 'react'
import { ToastInfo } from './ToastInfo'
import { ToastWithLink } from './ToastWithLink'
import { Text } from '../text/Text'
import { ToastSuccess } from './ToastSuccess'
import { ToastWarning } from './ToastWarning'
import { ToastError } from './ToastError'

export default {
  title: 'Atoms/Toast',
}

const Template = (args) => {
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-row items-center space-x-14">
        <Text size="xs" weight="normal" className="text-gray-900 w-14">
          With link
        </Text>

        <div className="w-full pl-1">
          <ToastWithLink
            message="A new update is available. See what’s new in version 2.0.4. "
            linkHref="#"
            linkText="Details"
          />
        </div>
      </div>

      <div className="flex flex-row items-center space-x-14">
        <Text size="xs" weight="normal" className="text-gray-900 w-14">
          Info
        </Text>
        <ToastInfo message="You've been signed out" />
      </div>

      <div className="flex flex-row items-center space-x-14">
        <Text size="xs" weight="normal" className="text-gray-900 w-14">
          Success
        </Text>
        <ToastSuccess message="Saved" />
      </div>

      <div className="flex flex-row items-center space-x-14">
        <Text size="xs" weight="normal" className="text-gray-900 w-14">
          Warning
        </Text>
        <ToastWarning message="Warning" />
      </div>

      <div className="flex flex-row items-center space-x-14">
        <Text size="xs" weight="normal" className="text-gray-900 w-14">
          Error
        </Text>
        <ToastError message="Error" />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
