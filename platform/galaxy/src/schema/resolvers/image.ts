import Env from '../../env'

import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { setupContext } from './utils'
import { Resolvers } from './typedefs'

import CFImageUploadClient from './clients/cf-image-upload'

type ResolverContext = {
  env: Env
}

const imageResolver: Resolvers = {
  Query: {
    imageUploadUrl: (_parent, {}, { env }: ResolverContext) =>
      new CFImageUploadClient(env.Icons).getImageUploadUrl(),
  },
}

const imageResolverComposition = {
  'Query.imageUploadUrl': [setupContext()],
}

export default composeResolvers(imageResolver, imageResolverComposition)
