module.exports = {
  stories: [
    '../app/components/**/*.stories.mdx',
    '../app/components/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  output: {
    hashFunction: 'xxhash64',
  },
  core: {
    builder: 'webpack5',
  },
  refs: () => {
    return {
      design: {
        title: 'Design System Storybook',
        url: 'http://localhost:6006',
      },
    }
  },
}
