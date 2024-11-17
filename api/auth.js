import { sendRequest, parseResponse } from './index';
import { bookDevice } from './booking';
import redis from '../redis';
import crypto from 'crypto';

export const login = async (email, password) => {
    const route = '/auth/login';
    const [uuid, uuid2] = [
        process.env.UUID1, process.env.UUID2
    ];

    const body = {
        basicAuth: { email, password },
        marketingConsentAccepted: false,
        uuid, uuid2
    };

    const response = await sendRequest(null, route, 'POST', body);
    console.log(response)
    if (!response.ok) return;

    const token = (await parseResponse(response))?.access_token;

    const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    let encryptedEmail = cipher.update(email, 'utf-8', 'hex');
    encryptedEmail += cipher.final('hex');

    const cipherPw = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encryptedPassword = cipherPw.update(password, 'utf-8', 'hex');
    encryptedPassword += cipherPw.final('hex');

    await redis.set(`auth:${token}`, JSON.stringify({ 
        email: encryptedEmail,
        password: encryptedPassword,
        iv: iv.toString('hex')
    }), 'EX');

    return token;
}

export const refreshLoginAndBook = async (token, deviceName) => {
    const auth = await redis.get(`auth:${token}`);
    if (!auth) return;

    const { email: encryptedEmail, password: encryptedPassword, iv } = JSON.parse(auth);
    const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex'); // Ensure this is the same key

    // Check the key length
    if (secretKey.length !== 32) {
        throw new Error('Invalid secret key length. It must be 32 bytes for AES-256.');
    }

    // Decrypt email
    const decipherEmail = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let email = decipherEmail.update(encryptedEmail, 'hex', 'utf-8');
    email += decipherEmail.final('utf-8');

    // Decrypt password
    const decipherPw = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let password = decipherPw.update(encryptedPassword, 'hex', 'utf-8');
    password += decipherPw.final('utf-8');

    // Call login with the decrypted email and password
    const new_token = await login(email, password);
    if (!new_token) return; // Handle case where login fails

    await redis.del(`booking:${token}`) // Delete old booking data

    // Book the device with the new token
    return await bookDevice(new_token, deviceName);
}
