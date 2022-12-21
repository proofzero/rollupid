import type { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Index Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_getGallery',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/GalleryItems',
      },
    },
    {
      name: 'kb_setGallery',
      params: [
        {
          $ref: '#/components/contentDescriptors/GalleryItems',
        },
      ],
      result: {
        name: 'set gallery result',
        schema: {},
      },
    },
  ],
}

export default schema
