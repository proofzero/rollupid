export const fromBase64 = (data: string) =>
  Uint8Array.from(atob(data), (c) => c.charCodeAt(0))

export const toBase64 = (buffer: ArrayBuffer) =>
  btoa(
    String.fromCharCode.apply(
      null,
      new Uint8Array(buffer) as unknown as number[]
    )
  )
