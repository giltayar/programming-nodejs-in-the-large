'use strict'
const fastify = require('fastify')
const {version} = require('../package.json')
const retry = require('p-retry')
const {Client} = require('pg')
const {computeFullName} = require('@giltayar/in-the-large-library')

async function createApp({databaseConnectionString}) {
  const app = fastify({logger: {}})

  const databaseClient = await retry(connectToDatabase)

  app.get('/healthz', async () => {
    await databaseClient.query('SELECT NOW()')

    return {version}
  })

  app.get('/api/tenants', async () => {
    const {rows} = await databaseClient.query('SELECT id, first_name, last_name FROM tenants')

    return rows.map(({id, first_name, last_name}) => ({
      id,
      firstName: first_name,
      lastName: last_name,
      name: computeFullName(first_name, last_name),
    }))
  })

  app.post('/api/tenants/:id', async req => {
    const {id} = req.params
    const {firstName, lastName} = req.body

    await databaseClient.query(`INSERT INTO tenants VALUES ($1, $2, $3)`, [id, firstName, lastName])

    return {}
  })

  app.put('/api/tenants/:id', async req => {
    const {id} = req.params
    const {firstName, lastName} = req.body

    await databaseClient.query(`UPDATE tenants SET first_name=$2, last_name=$3 WHERE id=$1`, [
      id,
      firstName,
      lastName,
    ])

    return {}
  })

  app.delete('/api/tenants/:id', async req => {
    const {id} = req.params

    await databaseClient.query('DELETE FROM tenants WHERE id=$1', [id])

    return {}
  })

  app.log.info({action: 'create-app', success: true})

  return app

  async function connectToDatabase() {
    const client = new Client({
      connectionString: databaseConnectionString,
    })
    await client.connect()
    client.on('error', () => 1)

    return client
  }
}

const databaseSchema = `
  CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    first_name VARCHAR,
    last_name VARCHAR
  )
`

module.exports = createApp
module.exports.databaseSchema = databaseSchema
