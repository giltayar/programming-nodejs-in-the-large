'use strict'
const {describe = global.describe, it = global.it} = require('mocha')
const {expect} = require('chai')

const {computeFullName} = require('../../src/in-the-large-library')

describe('library (unit)', function() {
  it('compute full name when it has both', async () => {
    expect(computeFullName('Gil', 'Tayar')).to.eql('Gil Tayar')
  })

  it('compute full name when it has only first', async () => {
    expect(computeFullName('Gil')).to.eql('Gil')
  })

  it('compute full name when it has only last', async () => {
    expect(computeFullName(undefined, 'Tayar')).to.eql('M. Tayar')
  })
})
