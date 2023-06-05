import { z } from 'zod'
import { Context } from '../../context'

export const GetDNSSecurityValuesSchema = z.object({
  dkimDomain: z.string(),
  dkimPublicKey: z.string(),
  dkimSelector: z.string(),
  spfHost: z.string(),
  dmarcEmail: z.string(),
})

export type GetDNSSecurityValuesResult = z.infer<
  typeof GetDNSSecurityValuesSchema
>

export const getDNSSecurityValues = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetDNSSecurityValuesResult> => {
  return {
    dkimDomain: ctx.INTERNAL_DKIM_DOMAIN as string,
    dkimPublicKey:
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqWMyGD0TLgDEb4S+J24oa1YDfcBZ7mOH8SuZnyl+I0W4AtDSI7mx+UdLP6BECOrmVe0g1D+33b3towMwlO5ndVwKv9HMLPeQKlWQOhE0CH/FTn3udYG5AkbgtYVyBq+sLZo9/sdh4OYlHudsWFl5wOLP0QLbzWlRCjYOUZrFHxjw+0Nj17Bu4h7i89t9yzqK79Xo2av/Dil1PzemIrOEZGlA5GHmQfI/hgVa0Q6QShPN/tsBSJuID1Uq9Ip2/PkxKFBXKuDW6VNqs5ax3eJ/20mlv1HISPfd2Cklg1rLbNWqr6fhUOHdIQCI1n9v7/X3fYss7wQldS0lnP7PheakswIDAQAB',
    dkimSelector: ctx.INTERNAL_DKIM_SELECTOR as string,
    spfHost: 'notifications.rollup.id',
    dmarcEmail: 'email-admin@rollup.id',
  }
}
