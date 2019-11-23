'use strict'
const {getAddressForService} = require('@applitools/docker-compose-testkit')

const createApp = require('../..')

async function setupApp(envName, composePath) {
  const postgresAddress = await getAddressForService(envName, composePath, 'postgres', 5432)
  const connectionString = `postgresql://user:password@${postgresAddress}/postgres`

  const app = await createApp({
    databaseConnectionString: connectionString,
  })

  await app.listen()

  return {
    baseUrl: () => `http://localhost:${app.server.address().port}`,
    address: () => `localhost:${app.server.address().port}`,
    app,
  }
}

module.exports = setupApp
