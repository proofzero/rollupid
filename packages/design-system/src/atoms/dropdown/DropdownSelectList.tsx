import React, { Fragment, useState } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { Text } from "../text/Text"
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckIcon,
} from '@heroicons/react/20/solid'
import { CryptoAddressType } from "@proofzero/types/address"
import { Button } from "../buttons/Button"
import { TbCirclePlus } from "react-icons/tb"


export type SelectListItem = {
    title: string
    label?: string
    icon?: JSX.Element
    details?: Record<string, any>
}

const modifyType = (string: string) => {
    if (string === CryptoAddressType.Wallet) {
        return "SC Wallet"
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const Dropdown = ({
    values,
    placeholder,
    ConnectButtonPhrase,
    ConnectButtonCallback,
    onSelect,
    multiple = false,
    onSelectAll,
    selectAllCheckboxTitle,
    selectAllCheckboxDescription,
    label,
}: {
    values: SelectListItem[],
    placeholder: string,
    onSelect: (selected: Array<SelectListItem> | SelectListItem) => void,
    multiple?: boolean
    ConnectButtonPhrase: string,
    ConnectButtonCallback: () => void,
    onSelectAll?: () => void,
    selectAllCheckboxTitle?: string
    selectAllCheckboxDescription?: string
    label?: string
}) => {
    /**
     * For single select
     */
    const [selectedValue, setSelectedValue] = useState<SelectListItem>(() => {
        const defaultItem = values.find(
            (item) => item.details?.default
        )
        return defaultItem
    })

    /**
     * For multi select
     */
    const [selectedValues, setSelectedValues] = useState<
        Array<SelectListItem>
    >([])
    const [allValuesSelected, setAllValuesSelected] =
        useState(false)

    return (
        <Listbox
            value={multiple ? selectedValues : selectedValue}
            onChange={(input) => {
                if (multiple) {
                    setSelectedValues(input as SelectListItem[])
                    if (!allValuesSelected) {
                        onSelect(input)
                    }
                } else {
                    setSelectedValue(input as SelectListItem)
                    onSelect(input)
                }
            }}
            multiple={multiple}
        >

            {({ open }) => (
                <>
                    {
                        label?.length
                            ? <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                                {label}
                            </Listbox.Label>
                            : null
                    }

                    <div className="relative select-none">
                        <Listbox.Button
                            className="border shadow-sm rounded-lg w-full transition-transform
                                    flex flex-row justify-between items-center py-2 px-3 hover:ring-1
                                    hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                            {!selectedValue && !selectedValues.length && !allValuesSelected && (
                                <Text size="sm" className="text-gray-400 truncate text-ellipsis">
                                    {placeholder}
                                </Text>
                            )}

                            {selectedValue?.title?.length && (
                                <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                    {selectedValue.title}
                                </Text>
                            )}

                            {selectedValues.length > 1 && !allValuesSelected && (
                                <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                    {selectedValues.length} items selected
                                </Text>
                            )}

                            {selectedValues.length === 1 && !allValuesSelected && (
                                <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                    {selectedValues[0].title} selected
                                </Text>
                            )}

                            {allValuesSelected && (
                                <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                    {selectAllCheckboxTitle}
                                </Text>
                            )}

                            {open ? (
                                <ChevronUpIcon className="w-5 h-5 shrink-0" />
                            ) : (
                                <ChevronDownIcon className="w-5 h-5 shrink-0" />
                            )}
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options
                                className="border shadow-lg rounded-lg absolute w-full mt-1 bg-white
                            pt-3 space-y-3 z-10">
                                {values?.length
                                    ? multiple
                                        /** 
                                         * Multi select
                                         */
                                        ? <>
                                            <div
                                                className="flex flex-row space-x-2 cursor-pointer items-center px-4"
                                                onClick={() => {
                                                    // We check if the value falsy because by default it's false
                                                    // in this method we flip it to true
                                                    if (!allValuesSelected) {
                                                        setSelectedValues([])

                                                        if (onSelectAll) {
                                                            onSelectAll()
                                                        }
                                                    }
                                                    setAllValuesSelected(!allValuesSelected)
                                                }}
                                            >
                                                <div>
                                                    <input
                                                        readOnly
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 bg-gray-50 
                                                    text-indigo-500 focus:ring-indigo-500"
                                                        checked={allValuesSelected}
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col truncate">
                                                    <Text
                                                        size="sm"
                                                        weight="medium"
                                                        className="text-gray-900 truncate text-ellipsis"
                                                    >
                                                        {selectAllCheckboxTitle}
                                                    </Text>
                                                    <Text
                                                        size="xs"
                                                        weight='normal'
                                                        className={`truncate w-full text-gray-500`}
                                                    >
                                                        {selectAllCheckboxDescription}
                                                    </Text>
                                                </div>
                                            </div>

                                            <div className="mx-4 w-100 border-b border-gray-200"></div>

                                            <div className="max-h-[140px] overflow-y-scroll thin-scrollbar">
                                                {values?.map((value) => {

                                                    const checked = !allValuesSelected &&
                                                        selectedValues
                                                            .map((sa) => sa.label)
                                                            .includes(value.label)

                                                    return <Listbox.Option
                                                        key={value.label}
                                                        value={value}
                                                        className={` rounded 
                                                        flex flex-row space-x-2 cursor-pointer py-1.5 px-4
                                                        ${checked ? "bg-gray-100" : "hover:bg-gray-50"}`}
                                                        disabled={allValuesSelected}
                                                    >
                                                        <div>
                                                            <input
                                                                readOnly
                                                                type="checkbox"
                                                                className={`
                                                                 h-4 w-4 rounded border-gray-300 bg-gray-50
                                                                 text-indigo-500 focus:ring-indigo-500`}
                                                                checked={
                                                                    checked
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex-1 flex flex-col truncate">
                                                            <Text
                                                                size="sm"
                                                                weight="medium"
                                                                className={`truncate text-ellipsis ${allValuesSelected
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-900'
                                                                    }`}
                                                            >
                                                                {value.title}
                                                            </Text>
                                                            <Text
                                                                size="xs"
                                                                weight="normal"
                                                                className={`truncate w-full text-ellipsis ${allValuesSelected
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {modifyType(value.details.type as string)} -{' '}
                                                                {value.details.address}
                                                            </Text>
                                                        </div>
                                                    </Listbox.Option>
                                                })}
                                            </div>
                                        </>
                                        /**
                        * Single select
                        */
                                        : <div className="px-1 space-y-1 max-h-[140px]
                             overflow-y-scroll thin-scrollbar">
                                            {values.map((value) => (
                                                <Listbox.Option
                                                    className="flex flex-row space-x-2 cursor-pointer hover:bg-gray-50
                                    rounded-lg  w-full "
                                                    key={value.label}
                                                    value={value}
                                                >{({ selected }) => (
                                                    <div
                                                        className={`${selected ? 'bg-gray-100' : ""}
                                                         w-full h-full rounded-lg py-2 px-2 flex flex-row
                                                items-center justify-between`}
                                                    >
                                                        <div className="flex flex-row truncate items-center">
                                                            {
                                                                value.icon ?
                                                                    value.icon
                                                                    : null
                                                            }
                                                            <div className="flex flex-col truncate">
                                                                <Text
                                                                    size="sm"
                                                                    weight={selected ? 'medium' : 'normal'}
                                                                    className={`truncate w-full`}
                                                                >
                                                                    {value.title}
                                                                </Text>
                                                                {value.details.address ? <Text
                                                                    size="xs"
                                                                    weight='normal'
                                                                    className={`truncate w-full text-gray-500`}
                                                                >
                                                                    {modifyType(value.details.type as string)} -{' '}
                                                                    {value.details.address}
                                                                </Text> : null}
                                                            </div>
                                                        </div>
                                                        {selected ? (
                                                            <span className="flex items-center pl-3 text-indigo-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                )}
                                                </Listbox.Option>
                                            ))}
                                        </div> : null}
                                {values?.length
                                    ? <div className="mx-4 w-100 border-b border-gray-200"></div>
                                    : null
                                }
                                <div className="px-3 pb-3">
                                    <Button
                                        btnType="secondary-alt"
                                        onClick={ConnectButtonCallback}
                                        className={`w-full min-w-[238px] flex flex-row items-center gap-1 justify-center
                                         px-[12px]`}
                                    >
                                        <TbCirclePlus size={18} />
                                        <Text size="sm">{ConnectButtonPhrase}</Text>
                                    </Button>
                                </div>
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox >
    )
}
