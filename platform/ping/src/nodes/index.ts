import ReplyMessage from './replyMessage'

export const initReplyMessageByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = ReplyMessage.wrap(durableObject)
  // You can use the default namespace methods or shorthand methods `getByName` & `getById`
  const stub = MY_DO_BINDING.getByName(name)
  return stub
}
