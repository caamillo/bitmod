const { sendRequest, parseResponse } = require('./index')

export const getInfo = async (token) => {
    const route = '/user/info'
    const response = await sendRequest(token, route, 'GET')
    const data = await parseResponse(response)
    return data
}

export const getStatus = async (token) => {
    const route = '/user/status'
    const response = await sendRequest(token, route, 'GET')
    const data = await parseResponse(response)
    return data
}