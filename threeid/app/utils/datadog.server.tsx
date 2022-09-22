// import { client, v1 } from '@datadog/datadog-api-client';
// import bufferFrom from 'buffer-from'
// import pako from 'pako'

// import {
//   HttpLibrary,
//   RequestContext,
//   ResponseContext,
// } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-common'


// class Fetch implements HttpLibrary {
//   public debug = false

//   public async send(request: RequestContext): Promise<ResponseContext> {
//     if (this.debug) {
//       this.logRequest(request)
//     }

//     const method = request.getHttpMethod().toString()
//     let body = request.getBody()

//     let { compress } = request.getHttpConfig()
//     if (compress === undefined) {
//       compress = true
//     }

//     const requestHeaders = request.getHeaders()
//     if (typeof body === 'string') {
//       if (requestHeaders['Content-Encoding'] == 'gzip') {
//         body = bufferFrom(pako.gzip(body).buffer)
//       } else if (requestHeaders['Content-Encoding'] == 'deflate') {
//         body = bufferFrom(pako.deflate(body).buffer)
//       }
//     }

//     if (!requestHeaders['Accept-Encoding']) {
//       if (compress) {
//         requestHeaders['Accept-Encoding'] = 'gzip,deflate'
//       } else {
//         requestHeaders['Accept-Encoding'] = 'identity'
//       }
//     }

//     const response = await fetch(request.getUrl(), {
//       method: method,
//       body: body as BodyInit,
//       headers: requestHeaders,
//     })

//     const responseHeaders: { [name: string]: string } = {}
//     response.headers.forEach((value: string, name: string) => {
//       responseHeaders[name] = value
//     })

//     const responseBody = {
//       text: () => response.text(),
//       binary: () => response.arrayBuffer() as Promise<Buffer>,
//     }

//     const responseContext = new ResponseContext(
//       response.status,
//       responseHeaders,
//       responseBody
//     )
//     if (this.debug) {
//       this.logResponse(responseContext)
//     }

//     return responseContext
//   }

//   private logRequest(request: RequestContext): void {
//     const headers: { [key: string]: string } = {}
//     const originalHeaders = request.getHeaders()
//     for (const header in originalHeaders) {
//       headers[header] = originalHeaders[header]
//     }
//     if (headers['DD-API-KEY']) {
//       headers['DD-API-KEY'] = headers['DD-API-KEY'].replace(/./g, 'x')
//     }
//     if (headers['DD-APPLICATION-KEY']) {
//       headers['DD-APPLICATION-KEY'] = headers['DD-APPLICATION-KEY'].replace(
//         /./g,
//         'x'
//       )
//     }

//     const headersJSON = JSON.stringify(headers, null, 2).replace(/\n/g, '\n\t')
//     const method = request.getHttpMethod().toString()
//     const url = request.getUrl().toString()
//     const body = request.getBody()
//       ? JSON.stringify(request.getBody(), null, 2).replace(/\n/g, '\n\t')
//       : ''
//     const compress = request.getHttpConfig().compress || true

//     console.debug(
//       '\nrequest: {\n',
//       `\turl: ${url}\n`,
//       `\tmethod: ${method}\n`,
//       `\theaders: ${headersJSON}\n`,
//       `\tcompress: ${compress}\n`,
//       `\tbody: ${body}\n}\n`
//     )
//   }

//   private logResponse(response: ResponseContext): void {
//     const httpStatusCode = response.httpStatusCode
//     const headers = JSON.stringify(response.headers, null, 2).replace(
//       /\n/g,
//       '\n\t'
//     )
//     const body = response.body
//       ? JSON.stringify(response.body, null, 2).replace(/\n/g, '\n\t')
//       : ''

//     console.debug(
//       'response: {\n',
//       `\tstatus: ${httpStatusCode}\n`,
//       `\theaders: ${headers}\n`,
//       `\tbody: ${body}\n}\n`
//     )
//   }
// }

// const configuration = client.createConfiguration({
//     authMethods: {
//         //@ts-ignore
//         apiKeyAuth: DATADOG_API_KEY,
//     },
//     httpApi: new Fetch(),
// })
// const apiInstance = new v1.EventsApi(configuration);

// export default async (
//     title: string,
//     text: string,
//     aggregationKey: string,
//     tags: string[] = [],
//   ): Promise<void> => {
//     //@ts-ignore
//     if (!DATADOG_API_KEY) {
//       return
//     }
    
//     //@ts-ignore
//     const host = DAPP_HOST
//     tags.push(`host:${host}`)
//     const event = await apiInstance.createEvent({
//       body: {
//         title,
//         text,
//         tags,
//         aggregationKey,
//       },
//     })
//   }
  