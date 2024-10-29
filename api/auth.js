import { sendRequest, parseResponse } from './index'
import { bookDevice } from './booking'
import redis from '../redis'
import crypto from 'crypto'

export const login = async (email, password) => {
    const route = '/auth/login'
    const [uuid, uuid2] = [
        process.env.UUID1, process.env.UUID2
    ]

    const body = {
        basicAuth: { email, password },
        marketingConsentAccepted: false,
        uuid, uuid2
    }

    const response = await sendRequest(null, route, 'POST', body)
    if (!response.ok) return

    const token = (await parseResponse(response))?.access_token

    const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv)
   
    let encryptedEmail = cipher.update(email, 'utf-8', 'hex')
    encryptedEmail += cipher.final('hex')
   
    const cipherPw = crypto.createCipheriv('aes-256-cbc', secretKey, iv)
    let encryptedPassword = cipherPw.update(password, 'utf-8', 'hex')
    encryptedPassword += cipherPw.final('hex')
   
    await redis.set(`auth:${token}`, JSON.stringify({ 
        email: encryptedEmail,
        password: encryptedPassword,
        iv: iv.toString('hex')
    }), 'EX')

    return token
}

export const refreshLoginAndBook = async (token, deviceName) => {
    const auth = await redis.get(`auth:${token}`)
    if (!auth) return

    const { email: encryptedEmail, password: hashedPw, iv } = JSON.parse(auth)
    const secretKey = Bun.env.SECRET_KEY

    const decipherEmail = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'))
    let email = decipherEmail.update(encryptedEmail, 'hex', 'utf-8')
    email += decipherEmail.final('utf-8')

    const decipherPw = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'))
    let password = decipherPw.update(hashedPw, 'hex', 'utf-8')
    password += decipherPw.final('utf-8')

    const new_token = await login(email, password)
    return bookDevice(new_token, deviceName)
}