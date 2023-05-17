import React from 'react'
import { TosAndPPol } from './TosAndPPol'

export default {
    title: 'Atoms/Info/TosAndPPol',
    component: TosAndPPol,
}

const Template = (args) => (
    <>
        <div className='pb-64' />
        <TosAndPPol {...args} />
    </>

)

export const Default = Template.bind({})
