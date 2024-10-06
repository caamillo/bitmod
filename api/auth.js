const { sendRequest, parseResponse } = require('./index')

export const login = async (email, password) => {
    const route = '/auth/login'
    const [uuid, uuid2] = [
        process.env.UUID1, process.env.UUID2]
    
    const body = {
        basicAuth: {email, password},
        marketingConsentAccepted: false,
        uuid, uuid2
    }

    const response = await sendRequest(null, route, 'POST', body)
    if (response.ok) return (await parseResponse(response))?.access_token
}