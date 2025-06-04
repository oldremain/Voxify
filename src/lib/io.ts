type CallApiParams = {
    method: 'POST' | 'PUT' | 'GET' | 'DELETE'
    base: string
    url: string
    data?: any
    headers?: Record<string, string>
    mode?: RequestMode
}

export const callApi = async (params: CallApiParams) => {
    const options: RequestInit = { method: params.method }
    if (params.data) {
        if (
            params.data instanceof FormData ||
            params.data instanceof Blob ||
            params.data instanceof File
        ) {
            options.body = params.data
        } else {
            options.body = JSON.stringify(params.data)
            options.headers = { 'content-type': 'application/json' }
        }
    }
    if (params.headers) {
        options.headers = {
            ...(options.headers ?? {}),
            ...params.headers
        }
    }
    if (params.mode) {
        options.mode = params.mode
    }

    try {
        return await fetch(`${params.base}${params.url}`, options)
    } catch (err: any) {
        throw new Error(err.message)
    }
}
