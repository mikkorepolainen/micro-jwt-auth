'use strict'

const jwtAuth = require('../index')
const VALID_HEADER = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlLCJhdWQiOiJBbGJ1cXVlcnF1ZSJ9.HBEXCw5RPRbMclMIXG-cMIkLgD-hFqIyAyMvgsl6Hgc'
const VALID_HEADER2 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlLCJhdWQiOlsiQWxidXF1ZXJxdWUiLCJOZXcgTWV4aWNvIl19.FGn_pUU8z0zFrLqoTpkBb3XgN4wpJWdtmBPBnJxtqGI'
const JWT_CONTENT = { sub: '1234567890', name: 'Walter White', admin: true, aud: 'Albuquerque' }
const JWT_CONTENT2 = { sub: '1234567890', name: 'Walter White', admin: true, aud: ['Albuquerque', 'New Mexico'] }

test('Valid audience', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const result = await jwtAuth({ secret: 'mySecret', validAudiences: [ 'Albuquerque', 'New Mexico' ] })(() => 'Good job!')(request, response)

  expect(request.jwt).toEqual(JWT_CONTENT)
  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)

})

test('Valid audiences', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER2
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const result = await jwtAuth({ secret: 'mySecret', validAudiences: [ 'New Mexico', 'Old Mexico' ] })(() => 'Good job!')(request, response)

  expect(request.jwt).toEqual(JWT_CONTENT2)
  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)

})

test('Invalid audience', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const result = await jwtAuth({ secret: 'mySecret', validAudiences: [ 'New Mexico', 'Old Mexico' ] })(() => 'Good job!')(request, response)

  expect(request.jwt).toEqual(JWT_CONTENT)
  expect(response.end).toHaveBeenCalledWith('invalid audience')

})

test('Invalid audience custom response', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const customRes = `${Math.random()}`
  const result = await jwtAuth({ secret: 'mySecret', validAudiences: [ 'New Mexico', 'Old Mexico' ], resAudInvalid: customRes })(() => 'Good job!')(request, response)

  expect(request.jwt).toEqual(JWT_CONTENT)
  expect(response.end).toHaveBeenCalledWith(customRes)

})
