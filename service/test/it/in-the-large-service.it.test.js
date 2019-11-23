'use strict'
const path = require('path')
const {describe, it, before, after, beforeEach} = require('mocha')
const {expect} = require('chai')
const {v4: uuid} = require('uuid')
const {fetchAsJson, fetchAsJsonWithJsonBody} = require('@applitools/http-commons')
const {dockerComposeTool} = require('@applitools/docker-compose-mocha')
const {generateEnvVarsWithDependenciesVersions} = require('@applitools/docker-compose-testkit')
const packageJson = require('../../package.json')
const {prepareDatabase, resetDatabase} = require('../commons/setup-database')
const setupApp = require('./setup-app')

describe('in-the-large-service (it)', function() {
  const composePath = path.join(__dirname, 'docker-compose.yml')

  const envName = dockerComposeTool(before, after, composePath, {
    shouldPullImages: !!process.env.NODE_ENV && process.env.NODE_ENV !== 'development',
    brutallyKill: true,
    envVars: {
      ...generateEnvVarsWithDependenciesVersions(packageJson),
    },
  })

  before(() => prepareDatabase(envName, composePath))
  beforeEach(() => resetDatabase(envName, composePath))

  let baseUrl
  before(async () => ({baseUrl} = await setupApp(envName, composePath)))

  it('should return version on /healthz', async () => {
    expect(await fetchAsJson(`${baseUrl()}/healthz`)).to.eql({version: packageJson.version})
  })

  it('should return empty array on no users', async () => {
    expect(await fetchAsJson(`${baseUrl()}/api/tenants`)).to.eql([])
  })

  it('should return users after they are added', async () => {
    const tenant = {id: uuid(), firstName: 'Gil', lastName: 'Tayar'}

    await fetchAsJsonWithJsonBody(`${baseUrl()}/api/tenants/${tenant.id}`, tenant)

    expect(await fetchAsJson(`${baseUrl()}/api/tenants`)).to.eql([tenant])
  })

  it('should update a user', async () => {
    const tenant = {id: uuid(), firstName: 'Gil', lastName: 'Tayar'}

    await fetchAsJsonWithJsonBody(`${baseUrl()}/api/tenants/${tenant.id}`, tenant)

    const updatedTenant = {...tenant, lastName: 'Gayar'}

    await fetchAsJsonWithJsonBody(`${baseUrl()}/api/tenants/${tenant.id}`, updatedTenant, {
      method: 'PUT',
    })

    expect(await fetchAsJson(`${baseUrl()}/api/tenants`)).to.eql([updatedTenant])
  })

  it('should delete a user', async () => {
    const tenant1 = {id: uuid(), firstName: 'Gil', lastName: 'Tayar'}
    const tenant2 = {
      id: uuid(),
      firstName: 'Shai',
      lastName: 'Reznik',
    }

    await Promise.all([
      fetchAsJsonWithJsonBody(`${baseUrl()}/api/tenants/${tenant1.id}`, tenant1),
      fetchAsJsonWithJsonBody(`${baseUrl()}/api/tenants/${tenant2.id}`, tenant2),
    ])

    await fetchAsJson(`${baseUrl()}/api/tenants/${tenant1.id}`, {
      method: 'DELETE',
    })

    expect(await fetchAsJson(`${baseUrl()}/api/tenants`)).to.eql([tenant2])
  })
})
