import React from "react"
import warningIcon from "../../assets/warning.svg"
import { CTAProps } from "./cta"
import { Text } from '../../atoms/text/Text'
import { HiOutlineArrowRight } from "react-icons/hi"

export const Warning = ({ description,
    clickHandler,
    btnText, }: CTAProps) => {
    return <div
        className="w-full bg-orange-50 flex items-center justify-between
  rounded-lg shadow my-4 p-4"
    >
        <div className="flex flex-row items-center w-full">
            <img src={warningIcon} className='w-9 h-9 mr-1.5' />
            <Text weight="normal" size="sm" className="text-orange-700">
                {description}
            </Text>
        </div>
        <div
            onClick={() => {
                clickHandler()
            }}
            className='flex flex-row items-center cursor-pointer w-fit
         space-x-2'
        >
            <Text weight="normal" size="sm" className="text-orange-700">
                {btnText}
            </Text>
            <HiOutlineArrowRight size={16} className='text-orange-700' />
        </div>
    </div>
}