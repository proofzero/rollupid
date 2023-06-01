import React, { Fragment, useState } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { Text } from "../text/Text"
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckIcon,
} from '@heroicons/react/20/solid'
import { Button } from "../buttons/Button"
import { TbCirclePlus } from "react-icons/tb"
import { BadRequestError } from "@proofzero/errors"


export type DropdownSelectListItem = {
    title: string
    value?: string
    icon?: JSX.Element
    selected?: boolean
    subtitle?: string
}

export const Dropdown = ({
    items,
    placeholder,
    ConnectButtonPhrase,
    ConnectButtonCallback,
    onSelect,
    multiple = false,
    onSelectAll,
    selectAllCheckboxTitle,
    selectAllCheckboxDescription,
}: {
    items: Array<DropdownSelectListItem>,
    placeholder: string,
    onSelect: (selected: Array<DropdownSelectListItem> | DropdownSelectListItem) => void,
    multiple?: boolean
    ConnectButtonPhrase: string,
    ConnectButtonCallback: () => void,
    onSelectAll?: () => void,
    selectAllCheckboxTitle?: string
    selectAllCheckboxDescription?: string
}) => {

    const defaultItems = items.filter(
        (item) => item.selected
    )

    if (defaultItems.length > 1 && !multiple) {
        throw new BadRequestError(
            { message: "You can't have multiple items selected in a single select dropdown" }
        )
    }

    /**
     * For single select
     */
    const [selectedItem, setSelectedItem] = useState<DropdownSelectListItem | undefined>(() => {
        if (!multiple) return defaultItems[0]
    })

    /**
     * For multi select
     */
    const [selectedItems, setSelectedItems] = useState<
        Array<DropdownSelectListItem>
    >(() => {
        return multiple
            ? defaultItems
            : [] as Array<DropdownSelectListItem>
    })

    const [allItemsSelected, setAllItemsSelected] =
        useState(false)

    return (
        <Listbox
            value={multiple ? selectedItems : selectedItem}
            onChange={(input) => {
                if (multiple) {
                    setSelectedItems(input as DropdownSelectListItem[])
                    if (!allItemsSelected) {
                        //@ts-ignore
                        onSelect(input.map((i) => i.value))
                    }
                } else {
                    setSelectedItem(input as DropdownSelectListItem)
                    //@ts-ignore
                    onSelect(input.value)
                }
            }}
            multiple={multiple}
        >

            {({ open }) => (
                <div className="relative select-none">
                    <Listbox.Button
                        className="border shadow-sm rounded-lg w-full transition-transform
                                    flex flex-row justify-between items-center py-2 px-3 hover:ring-1
                                    hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                        {!selectedItem && !selectedItems.length && !allItemsSelected && (
                            <Text size="sm" className="text-gray-400 truncate text-ellipsis">
                                {placeholder}
                            </Text>
                        )}

                        {selectedItem?.title?.length && (
                            <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                {selectedItem.title}
                            </Text>
                        )}

                        {selectedItems.length > 1 && !allItemsSelected && (
                            <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                {selectedItems.length} items selected
                            </Text>
                        )}

                        {selectedItems.length === 1 && !allItemsSelected && (
                            <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                                {selectedItems[0].title} selected
                            </Text>
                        )}

                        {allItemsSelected && (
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
                            {items?.length
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
                                                if (!allItemsSelected) {
                                                    setSelectedItems([])

                                                    if (onSelectAll) {
                                                        onSelectAll()
                                                    }
                                                }
                                                setAllItemsSelected(!allItemsSelected)
                                            }}
                                        >
                                            <div>
                                                <input
                                                    readOnly
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 bg-gray-50 
                                                    text-indigo-500 focus:ring-indigo-500"
                                                    checked={allItemsSelected}
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
                                            {items?.map((item) => {

                                                const checked = !allItemsSelected &&
                                                    selectedItems
                                                        .map((si) => si.value)
                                                        .includes(item.value)

                                                return <Listbox.Option
                                                    key={item.value}
                                                    value={item}
                                                    className={` rounded 
                                                        flex flex-row space-x-2 cursor-pointer py-1.5 px-4
                                                        ${checked ? "bg-gray-100" : "hover:bg-gray-50"}`}
                                                    disabled={allItemsSelected}
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
                                                            className={`truncate text-ellipsis ${allItemsSelected
                                                                ? 'text-gray-400'
                                                                : 'text-gray-900'
                                                                }`}
                                                        >
                                                            {item.title}
                                                        </Text>
                                                        {item.subtitle
                                                            ? <Text
                                                                size="xs"
                                                                weight="normal"
                                                                className={`truncate w-full text-ellipsis ${allItemsSelected
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {item.subtitle}
                                                            </Text>
                                                            : null}
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
                                        {items.map((item) => {
                                            const preselected = selectedItem?.value === item.value
                                            return (<Listbox.Option
                                                className="flex flex-row space-x-2 cursor-pointer hover:bg-gray-50
                                    rounded-lg  w-full "
                                                key={item.value}
                                                value={item}
                                            >{({ selected }) => (
                                                <div
                                                    className={`${selected || preselected ? 'bg-gray-100' : ""}
                                                         w-full h-full rounded-lg py-2 px-2 flex flex-row
                                                items-center justify-between`}
                                                >
                                                    <div className="flex flex-row truncate items-center">
                                                        {
                                                            item.icon ?
                                                                item.icon
                                                                : null
                                                        }
                                                        <div className="flex flex-col truncate">
                                                            <Text
                                                                size="sm"
                                                                weight={selected || preselected ? 'medium' : 'normal'}
                                                                className={`truncate w-full`}
                                                            >
                                                                {item.title}
                                                            </Text>
                                                            {
                                                                item.subtitle
                                                                    ? (<Text
                                                                        size="xs"
                                                                        weight='normal'
                                                                        className={`truncate w-full text-gray-500`}
                                                                    >
                                                                        {item.subtitle}
                                                                    </Text>)
                                                                    : null
                                                            }
                                                        </div>
                                                    </div>
                                                    {selected || preselected ? (
                                                        <span className="flex items-center pl-3 text-indigo-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </div>
                                            )}
                                            </Listbox.Option>)
                                        })}
                                    </div> : null}
                            {items?.length
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
            )}
        </Listbox >
    )
}
