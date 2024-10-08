# BitMod

## What is this?
basically I use to rent scooters and I needed a way to rent them for life (endless parking spot glitch).

## Features

- ElysiaJS HTTPServer (Bun based) that handles APIs between User <-> Bit
- Endless Book Glitch
- Redis cache-db that stores booking infos + Cron that every minute checks if a device needs to be re-booked

## How can I launch it?
U just have to add in ur `.env`:

```
URL=<bit_url>
UUID1=<uuid1>
UUID2=<uuid2>
```

I dont even know what uuid1 and uuid2 is used for but I found mine through the login request.

## Todos

Only thing I left to do is also to store email:pass of bit user and when token is expired could be generated automatically.

## Disclaimer
[Bit Mobility](https://bitmobility.it/) is a trademark of BIT Mobility Srl, and this project is user-made and not associated with the company in any way.
