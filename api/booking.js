import { sendRequest, parseResponse } from './index'
import redis from '../redis'

export const bookDevice = async (token, deviceName) => {
    const route = '/booking'
    const response = await sendRequest(token, route, 'POST', { deviceName })
    if (response.ok) await redis.set(`booking:${token}`, JSON.stringify({ device: deviceName, booking: true, pushed_at: new Date().toISOString() }), 'EX')
    const data = await parseResponse(response)
    return data
}

export const unBookDevice = async (token) => {
    const route = '/booking'
    const response = await sendRequest(token, route, 'DELETE')
    if (response.ok) await redis.set(`booking:${token}`, JSON.stringify({ booking: false }), 'EX')
    const data = await parseResponse(response)
    return data
}