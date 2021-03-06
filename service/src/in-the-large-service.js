'use strict'
const fastify = require('fastify')
const {version} = require('../package.json')
const {makeTenantDal, databaseSchema} = require('./dal/tenants')

async function createApp({databaseConnectionString}) {
  const app = fastify({logger: {}})

  const dal = makeTenantDal({databaseConnectionString})

  await dal.connect()

  app.get('/healthz', async () => {
    await dal.checkHealth()

    return {version}
  })

  app.get('/api/tenants', async () => {
    return dal.listTenants()
  })

  app.post('/api/tenants/:id', async req => {
    const {id} = req.params
    const {firstName, lastName} = req.body

    await dal.addTenant(id, firstName, lastName)

    return {}
  })

  app.put('/api/tenants/:id', async req => {
    const {id} = req.params
    const {firstName, lastName} = req.body

    await dal.updateTenant(id, firstName, lastName)

    return {}
  })

  app.delete('/api/tenants/:id', async req => {
    const {id} = req.params

    await dal.deleteTenant(id)

    return {}
  })

  app.log.info({action: 'create-app', success: true})

  return app
}

module.exports = createApp
module.exports.databaseSchema = databaseSchema
