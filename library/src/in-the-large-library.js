'use strict'

function computeFullName(firstName, lastName) {
  if (lastName == null) {
    return firstName
  }

  if (firstName == null) {
    return `M. ${lastName}`
  }
  return [firstName, lastName].join(' ')
}

module.exports = {
  computeFullName,
}
