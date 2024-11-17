const cron = require('node-cron')
import redis from './redis'  
import { bookDevice } from './api/booking'

const BOOKING_EXPIRY = 10 * 60 * 1000; // 10 minutes in seconds

const checkBookings = async () => {
    try {
        const keys = await redis.keys('booking:*'); // Fetch all booking keys
        for (const key of keys) {
            let status = JSON.parse(await redis.get(key));
            const d = new Date(status.pushed_at).getTime()
            if (new Date().getTime() < d + BOOKING_EXPIRY) continue
    
            const device = status.device
            const token = key.split(':')[1]
            console.log(`Re-booking device ${device} of user ${token}`)
            await bookDevice(token, device)
        }
    } catch (err) {
        console.log(err)
    }
}

cron.schedule('*/5 * * * * *', async () => {
    console.log('Checking for active bookings...');
    await checkBookings();
})