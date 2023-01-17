// import type { FilterProps } from './index'
import FiltersComp from './index'
import React, { useState } from 'react'

// import threeIdLogo from '../../../assets/three-id-logo.svg'
// import noFilter from '../../../assets/no-filter.svg'

export default {
  title: 'Atoms/NFTs',
  component: FiltersComp,
}

const Template = () => {
  const [openedFilters, setOpenedFilters] = useState(false)
  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')

  return (
    <>
      <FiltersComp
        colFilters={[
          { title: 'All Collections', img: undefined },
          { title: 'Untitled Collections', img: undefined },
        ]}
        curFilter={curFilter}
        openedFilters={openedFilters}
        textFilter={textFilter}
        pfp={'https://avatars.githubusercontent.com/u/96090171?s=400&v=4'}
        setOpenedFilters={setOpenedFilters}
        setTextFilter={setTextFilter}
        setCurFilter={setCurFilter}
      />
    </>
  )
}

export const Filters = Template.bind({})
