const cron = require('node-cron')
import redis from './redis'  
import { bookDevice } from './api/booking'

const BOOKING_EXPIRY = 12 * 60 * 1000; // 11 minutes in seconds

const checkBookings = async () => {
    try {
        const keys = await redis.keys('booking:*'); // Fetch all booking keys
        for (const key of keys) {
            let status = JSON.parse(await redis.get(key));
            const d = new Date(status.pushed_at).getTime()
            if (new Date().getTime() < d + BOOKING_EXPIRY) continue
    
            const device = status.device
            const token = key.split(':')[1]
            const res = await bookDevice(token, device)

            if (res) console.log(`Re-booked device ${device} of user ${token}`)
            else console.log(`Failed to rebook device ${device} of user ${token}`)
        }
    } catch (err) {
        console.log(err)
    }
}

if (process.argv?.[2] === '--flush')
    await redis.flushAll()

cron.schedule('*/5 * * * * *', async () => {
    console.log('Checking for active bookings...');
    await checkBookings();
})