import { DocumentationBadge } from './index'

export default {
  title: 'Atoms/DocumentationBadge',
  component: DocumentationBadge,
}

const Template = () => <DocumentationBadge url={'https://docs.rollup.id'} />

export const Default = Template.bind({})
