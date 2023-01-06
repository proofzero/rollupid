module.exports = {
  stories: [
    '../app/components/**/*.stories.mdx',
    '../app/components/**/*.stories.@(js|jsx|ts|tsx)',
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
    builder: '@storybook/builder-webpack5',
  },
  refs: () => {
    return {
      design: {
        title: 'Design System Storybook',
        url: 'http://localhost:6006',
      },
    }
  },
  // webpackFinal: async (config, { configType }) => {
  //   const { module } = config
  //   const { rules } = module
  //   return {
  //     ...config,
  //     module: { ...config.module, rules: rules },
  //   }
  // },
}
