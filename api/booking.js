import { sendRequest, parseResponse } from './index'
import { refreshLoginAndBook } from './auth'
import redis from '../redis'

export const bookDevice = async (token, deviceName) => {
    const route = '/booking'
    let response = await sendRequest(token, route, 'POST', { deviceName })
    if (response.ok) await redis.set(`booking:${token}`, JSON.stringify({ device: deviceName, pushed_at: new Date().toISOString() }), 'EX')
    else response = await refreshLoginAndBook(token, deviceName)

    const data = await parseResponse(response)
    return data
}

export const unBookDevice = async (token) => {
    const route = '/booking'
    const response = await sendRequest(token, route, 'DELETE')
    if (response.ok) await redis.del(`booking:${token}`)
    const data = await parseResponse(response)
    return data
}