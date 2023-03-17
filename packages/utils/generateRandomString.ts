export default function generateRandomString(length: number): string {
  if (!length || length < 0)
    throw new Error(
      'Length of string to be generated has to be a positive number'
    )

  const buffer = new Uint8Array(length / 2)
  const randomBuffer = crypto.getRandomValues(buffer)
  const result = Array.from(randomBuffer, (i) =>
    i.toString(16).padStart(2, '0')
  ).join('')
  console.assert(result.length === length)
  return result
}
