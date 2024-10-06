export const URL = process.env.URL

const getReqHeaders = (token) => {
    const headers = new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "accept-encoding": "gzip, deflate, br",
        "if-none-match": 'W/"81-rx22sIsOgWAMlGTlne7sCzfSfOY"',
        "user-agent": "bit/709 CFNetwork/1568.100.1 Darwin/24.0.0",
        "accept-language": "en-GB,en;q=0.9",
        "accept-version": "2.15.0"
    })
    if (token) headers.append('auth', token)
    return headers
}

export const sendRequest = async (token, route, method, body) =>
    fetch(URL + route, { method, headers: getReqHeaders(token), body: JSON.stringify(body) })

export const parseResponse = async (response) => {
    const blob = await response.blob()
    const data = await blob.text()

    try {
        return JSON.parse(data)
    } catch (err) {
        console.log('could not parse in JSON')
        return data
    }
}