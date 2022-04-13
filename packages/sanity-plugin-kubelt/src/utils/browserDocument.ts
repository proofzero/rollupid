/**
 * Check that the calling code is indeed running in the browser. Throws an exception if not.
 */
export const checkDocument = () => {
  if (!document) {
    throw new ReferenceError(
      "Plugin running outside of browser context; document undefined"
    );
  }
};

export default {
  checkDocument,
};
