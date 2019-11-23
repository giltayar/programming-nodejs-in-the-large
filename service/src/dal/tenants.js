'use strict'
const {Client} = require('pg')
const retry = require('p-retry')
const {computeFullName} = require('@giltayar/in-the-large-library')

function makeTenantDal({databaseConnectionString}) {
  let databaseClient
  let databaseError
  async function connect() {
    await retry(
      async () => {
        databaseClient = new Client({
          connectionString: databaseConnectionString,
        })
        await databaseClient.connect()
      },
      {onFailedAttempt: err => console.log(`@@@GIL failed`, err) /* @@@GIL*/},
    )
    databaseClient.on('error', err => (databaseError = err))
  }

  async function listTenants() {
    const {rows} = await databaseClient.query('SELECT id, first_name, last_name FROM tenants')

    return rows.map(({id, first_name, last_name}) => ({
      id,
      firstName: first_name,
      lastName: last_name,
      name: computeFullName(first_name, last_name),
    }))
  }

  async function addTenant(id, firstName, lastName) {
    await databaseClient.query(`INSERT INTO tenants VALUES ($1, $2, $3)`, [id, firstName, lastName])
  }

  async function updateTenant(id, firstName, lastName) {
    await databaseClient.query(`UPDATE tenants SET first_name=$2, last_name=$3 WHERE id=$1`, [
      id,
      firstName,
      lastName,
    ])
  }

  async function deleteTenant(id) {
    await databaseClient.query('DELETE FROM tenants WHERE id=$1', [id])
  }

  async function checkHealth() {
    if (databaseError) throw databaseError
    if (!databaseClient) throw new Error('Database client is not ready')

    await databaseClient.query('SELECT NOW()')
  }

  return {
    connect,
    checkHealth,
    listTenants,
    addTenant,
    updateTenant,
    deleteTenant,
  }
}

const databaseSchema = `
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  first_name VARCHAR,
  last_name VARCHAR
)
`

module.exports = {
  makeTenantDal,
  databaseSchema,
}
