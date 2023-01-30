import React from 'react'
import { Text } from '../../atoms/text/Text'
import { BsGear } from 'react-icons/bs'
import { Button } from '../../atoms/buttons/Button'

export type CTAProps = {
  clickHandler?: () => void
}

export const CTA = ({ clickHandler }: CTAProps) => (
  <div
    className="w-full bg-white flex items-center justify-between
rounded-lg border shadow"
  >
    <div className="flex items-center">
      <div
        className="bg-[#eef2ff] min-h-[70px] min-w-[70px] 
        flex items-center justify-center
        rounded-lg m-3"
      >
        <BsGear
          style={{ stroke: '#6366F1', strokeWidth: '0.2' }}
          className="text-indigo-500 font-bold m-3"
          size={35}
        />
      </div>
      <div>
        <Text weight="medium" size="lg" className="mb-1">
          You're almost there!
        </Text>
        <Text weight="normal" size="sm" className="text-gray-500">
          Head on to the 0xAuth page to complete the setup
        </Text>
      </div>
    </div>
    <Button
      type="button"
      btnType="primary-alt"
      className="m-7"
      onClick={() => {
        clickHandler()
      }}
    >
      Complete Setup
    </Button>
  </div>
)
