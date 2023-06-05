import * as dnsPacket from '@dnsquery/dns-packet'

export default async function (
  domain: string,
  recordType: 'TXT' | 'CNAME'
): Promise<string | null> {
  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const buf = dnsPacket.encode({
    type: 'query',
    id: getRandomInt(1, 65534),
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [
      {
        type: recordType,
        name: domain,
      },
    ],
  })

  console.log(`Getitng DNS record of type ${recordType} for domain ${domain}`)
  const dnsQuery = await fetch('https://cloudflare-dns.com/dns-query', {
    headers: {
      'Content-Type': 'application/dns-message',
      'Content-Length': buf.byteLength.toString(),
    },
    method: 'POST',
    body: buf.buffer,
  })

  const responseBuffer = new Uint8Array(await dnsQuery.arrayBuffer())
  const packet = dnsPacket.decode(responseBuffer)
  if (!packet.answers || !packet.answers.length) return null

  //We take only the first answer as if we're being specific enough with the
  //domain, there should only be one
  const response = packet.answers[0]
  const recValue =
    response.type === 'TXT'
      ? new TextDecoder().decode((response.data as Buffer[])[0])
      : (response.data as string)
  return recValue
}
