// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import defaultResolve from "part:@sanity/base/document-actions/";

import Publish from "../actions/KubeltPublishAction";

export default function resolveDocumentActions(props) {
  return [...defaultResolve(props), Publish];
}
