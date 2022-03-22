export const checkDocument = () => {
  if (!document) {
    throw new ReferenceError('Plugin running outside of browser context; document undefined')
  }
}

export default {
  checkDocument,
}
