import { Elysia } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { cors } from '@elysiajs/cors'

import { getInfo, getStatus } from './api/user'
import { bookDevice, unBookDevice } from './api/booking'
import { getDevices } from './api/device'
import { login } from './api/auth'

const PESCARA_CITYCODE = 81

new Elysia()
    .use(bearer())
    .use(cors())
    .post('/login', async ({ body: { email, password }, set }) => {
        const token = await login(email, password)
        if (token) return { token }
    
        set.status = 400
        return { message: 'Error' }
    })
    .group('/api', (app) => {
        app.onBeforeHandle(async ({ set, bearer }) => {
            const info = await getInfo(bearer)
            if (!info) {
                set.status = 401
                return { message: 'Token expired' }
            }
        })        
        return app
            .get('/devices', async ({ bearer }) => getDevices(bearer, PESCARA_CITYCODE))
            .get('/info', async ({ bearer }) => getInfo(bearer))
            .get('/status', async ({ bearer }) => getStatus(bearer))
            .get('/book', async ({ query: {name}, bearer }) => bookDevice(bearer, name))
            .get('/unbook', async ({ bearer }) => unBookDevice(bearer))
    })
    .listen({
        port: 5001,
        tls: {
            key: Bun.file(`${import.meta.dir}/certs/server.key`),
            cert: Bun.file(`${import.meta.dir}/certs/server.crt`)
        }
    })