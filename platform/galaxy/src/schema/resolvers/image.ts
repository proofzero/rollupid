import Env from '../../env'

import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { setupContext } from './utils'
import { Resolvers } from './typedefs'

type ResolverContext = {
  env: Env
}

const imageResolver: Resolvers = {
  Query: {
    imageUploadUrl: async (_parent: any, {}, { env }: ResolverContext) => {
      console.log(env)
      return 'Foo'
    },
  },
}

const imageResolverComposition = {
  'Query.imageUploadUrl': [setupContext()],
}

export default composeResolvers(imageResolver, imageResolverComposition)
