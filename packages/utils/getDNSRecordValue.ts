import * as dnsPacket from '@dnsquery/dns-packet'

export default async function (
  domain: string,
  recordType: 'TXT' | 'CNAME'
): Promise<string[] | undefined> {
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
  if (!packet.answers || !packet.answers.length) return undefined

  const td = new TextDecoder()
  const values = packet.answers.map((a) => {
    if (a.type === 'TXT') {
      const strParts = new Array(a.data.length)
      for (let i = 0; i < a.data.length; i++) {
        strParts.push(td.decode(a.data[i] as Buffer))
      }

      return strParts.join('')
    }

    return a.data as string
  })

  return values
}
