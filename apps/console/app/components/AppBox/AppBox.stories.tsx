import AppBox from '.'

export default {
    title: 'Organisms/Applications/Box',
    component: AppBox,
}

const Template = () => <AppBox createLink='/' apps={[{
    createdDate: new Date().toDateString(),
    discordUser: 'Discord user',
    domains: ['Domain#1'],
    icon: 'https://picsum.photos/250/250',
    id: 'id',
    mediumUser: 'Medium user',
    mirrorURL: 'Mirror URL',
    name: 'Baseball',
    published: true,
    redirectURL: 'redirectURL',
    scopes: [{
        name: 'ab',
        category: 'cd',
        permission: 'ef'
    }],
    secret: 'This is a secret',
    termsURL: 'Terms URL',
    twitterUser: 'Twitter user',
    websiteURL: 'Website URL'
}]} />

export const Default = Template.bind({})
