const { sendRequest, parseResponse } = require('./index')

export const getDevices = async (token, cityId) => {
    const route = `/device?businessLineId=${cityId}`
    const response = await sendRequest(token, route, 'GET')
    const data = await parseResponse(response)
    return data
}