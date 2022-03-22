import {route} from '@sanity/base/router'
import SanityKubelt from './SanityKubelt'

export default {
  router: route('/*'),
  name: 'kubelt',
  title: 'Kubelt',
  component: SanityKubelt,
}
