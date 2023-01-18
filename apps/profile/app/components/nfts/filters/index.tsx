import InputText from '../../inputs/InputText'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import noFilter from '../../../assets/no-filter.svg'

import { FaSearch } from 'react-icons/fa'
import { HiChevronUp, HiOutlineCheck } from 'react-icons/hi'

export type FilterProps = {
  colFilters: { title: string; img?: string }[]
  curFilter: string
  openedFilters: boolean
  textFilter: string
  pfp: string

  setOpenedFilters: (val: boolean) => void
  setTextFilter: (val: string) => void
  setCurFilter: (val: string) => void
}

const Filters = ({
  colFilters,
  setCurFilter,
  curFilter,
  openedFilters,
  setOpenedFilters,
  setTextFilter,
  textFilter = '',
  pfp,
}: FilterProps) => {
  return (
    <div
      className="w-full sm:w-auto mt-1 block
                   rounded-md border-gray-300
                   py-2 text-base"
    >
      <div>
        <div className="dropdown relative">
          <button
            className="
          dropdown-toggle
          ease-in-out
          flex flex-row
          justify-between items-center
          text-[#1f2937] text-base font-medium
          shadow-sm
          min-w-full
          border border-solid border-[#d1d5db]
          bg-white hover:bg-[#d1d5db]
          py-[10px] px-[12px]
          rounded-md
          "
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={() => {
              setOpenedFilters(!openedFilters)
            }}
          >
            {curFilter}
            <HiChevronUp
              size={20}
              className={openedFilters ? 'rotate-180 transition' : 'transition'}
            />
          </button>
          <ul
            className="
          dropdown-menu
          w-full
          absolute z-50
          text-base float-left
          max-h-[23rem] min-[480px]:max-h-[20rem] 
          rounded-lg shadow-xl
          m-0 mt-1 py-2 px-1
          overflow-auto
          bg-white bg-clip-padding
          hidden border-none list-none
          items-center
        "
            aria-labelledby="dropdownMenuButton1"
          >
            <li className="sticky top-0">
              <InputText
                heading=""
                placeholder={'Search'}
                Icon={FaSearch}
                onChange={(val) => {
                  setTextFilter(val)
                }}
              />
            </li>
            {colFilters
              .filter((filter: any) =>
                filter.title.toLowerCase().includes(textFilter.toLowerCase())
              )
              .map((colName: any, i: number) => (
                <li key={`${colName.title}_${i}`}>
                  <div
                    className="
                      dropdown-item
                      flex flex-row
                      select-none
                      overflow-auto
                      bg-transparent hover:bg-gray-100
                      w-full sm:max-w-[17rem]
                      py-2 pl-1
                      block"
                    onClick={(event: any) => {
                      setCurFilter(colName.title || 'Untitled Collection')
                    }}
                  >
                    {colName.title === 'All Collections' || colName.img ? (
                      <img
                        className="w-[1.5em] h-[1.5em] rounded-full"
                        src={
                          colName.title === 'All Collections'
                            ? pfp
                            : colName.img
                        }
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null
                          currentTarget.src = noFilter
                        }}
                        alt="+"
                      />
                    ) : (
                      <div className="w-[1.5em] h-[1.5em] bg-[#E8E8E8] rounded-full"></div>
                    )}

                    {curFilter === colName.title ||
                    curFilter === 'Untitled Collection' ? (
                      <Text
                        className="
                               focus:outline-none w-full
                                px-3 flex flex-row items-center
                                justify-between"
                      >
                        <div className="truncate sm:max-w-[12rem] max-w-[17rem]">
                          {colName.title}
                        </div>
                        <HiOutlineCheck size={20} />
                      </Text>
                    ) : (
                      <Text className="focus:outline-none pl-3">
                        {colName.title}
                      </Text>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Filters
