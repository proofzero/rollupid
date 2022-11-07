export default async (address: string): Promise<boolean> => {
  // @ts-ignore
  const proof = await PROOFS.get(address)
  // @ts-ignore
  return !!proof || !!TEST_ENV
}
