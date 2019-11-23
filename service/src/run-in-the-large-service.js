#!/usr/bin/env node
'use strict'
const createApp = require('../')

async function main() {
  const app = await createApp({databaseConnectionString: process.env.DATABASE_CONNECTION_STRING})

  const address = await app.listen(process.env.PORT || 3000, '0.0.0.0')
  await app.ready()

  process.on('SIGTERM', async () => {
    await app.close()
  })

  app.log.info({action: 'listen-app', address, success: true})
}

main().catch(async err => {
  try {
    console.error(`Webserver crashed: ${err.stack || err.toString()}`)
  } finally {
    process.exit(1)
  }
})
