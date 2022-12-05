export default (required: string[] = [], env: Record<string, unknown>) => {
  required.forEach((name) => {
    if (env[name] == null) {
      throw `missing ${name} in the environment`
    }
  })
}
