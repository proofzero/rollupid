

// TODO: REMOVE ADDRESS PARAM
export async function oortSend(method: string, body: object, address: string) {
    const id = method.replace(/^.+_/,'').replace(/[A-Z]/g, m => "-" + m.toLowerCase())
    console.info("json rpc request with id: ", id)

    //@ts-ignore
    const response = await fetch(`${OORT_SCHEMA}://${OORT_HOST}/${address}/jsonrpc`, {
        method: "POST",
        headers: {
            "Access-Control-Allow-Origin": "*",
            'content-type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            id,
            jsonrpc: "2.0",
            method,
            ...body
        }),
    });
    return response.json();
}