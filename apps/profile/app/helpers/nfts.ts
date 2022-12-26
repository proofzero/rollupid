export const mergeSortedNfts = (a: any, b: any) => {
  var sorted = [],
    indexA = 0,
    indexB = 0

  while (indexA < a.length && indexB < b.length) {
    if (sortNftsFn(a[indexA], b[indexB]) > 0) {
      sorted.push(b[indexB++])
    } else {
      sorted.push(a[indexA++])
    }
  }

  if (indexB < b.length) {
    sorted = sorted.concat(b.slice(indexB))
  } else {
    sorted = sorted.concat(a.slice(indexA))
  }

  return sorted
}

export const sortNftsFn = (a: any, b: any) => {
  if (b.collectionTitle === null) {
    return -1
  } else {
    return a.collectionTitle?.localeCompare(b.collectionTitle) || 1
  }
}
