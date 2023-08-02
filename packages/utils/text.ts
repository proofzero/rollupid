export const obfuscateAlias = (alias: string): string => {
  const percentage = 0.1

  let targetedSection = alias
  if (alias.includes('@')) {
    targetedSection = alias.split('@')[0]
  }

  const visibleLen = Math.max(
    1,
    Math.floor(targetedSection.length * percentage)
  )
  const visibleSection = targetedSection.slice(0, visibleLen)

  let obfuscatedAlias = `${visibleSection}**`
  if (alias.includes('@')) {
    obfuscatedAlias = `${obfuscatedAlias}@${alias.split('@')[1]}`
  }

  return obfuscatedAlias
}
