// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import defaultResolve from "part:@sanity/base/document-badges";

/**
 * This applies a badge to any object that has the kubeltItem schema applied
 * and is indeed named. This is a bit old and might be removed.
 */
export default function resolveDocumentBadges(props) {
  const { draft, published } = props;
  const combinedObj = { ...published, ...draft };

  const badges = [];

  return [...defaultResolve(props), ...badges];
}
