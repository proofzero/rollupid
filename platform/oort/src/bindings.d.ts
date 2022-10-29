interface Environment {
  Address: DurableObjectNamespace
  Core: DurableObjectNamespace
  CORE_CLAIMS?: KVNamespace
  OBJECTS: R2Bucket
  THREEID?: KVNamespace
  THREEID_INVITE_CODES?: KVNamespace
}
