interface Env {
  FETCH_URL: string
}

export default {
  async fetch(request, env: Env) {
    console.debug(`Fetching from ${env.FETCH_URL}`)
    const dataFromFetch = await fetch(env.FETCH_URL)
    console.debug(
      `Status code ${dataFromFetch.status}, text: ${dataFromFetch.statusText}`
    )
    return dataFromFetch
  },
}
