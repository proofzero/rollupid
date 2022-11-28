import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'
import Env from '../../env'
import { setupContext } from './utils'

type ResolverContext = {
  env: Env
}

const imageResolver: any = {
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
