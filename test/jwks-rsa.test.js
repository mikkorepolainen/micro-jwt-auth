/* eslint-env jest */
'use strict'

const jwtAuth = require('../index')
const VALID_HEADER = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlfQ.1wOt4ydXa9HqdT_1NATGR5zZXm1Hb8prLG5gbsZ6fqA'
const VALID_HEADER2 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiY2RlZiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlfQ.aQRs409SELcrURUWuri8gOILoGInojqoiXnhiLod2fw'
const JWT_CONTENT = { sub: '1234567890', name: 'Walter White', admin: true }

test('With jwks-rsa configuration', async () => {
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

  const result = await jwtAuth({ jwksRsaConfig: {} })(() => 'Good job!')(request, response)

  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)
  expect(request.jwt).toEqual(JWT_CONTENT)
})

test('With jwks-rsa configuration and fixed kid', async () => {
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

  const result = await jwtAuth({ jwksRsaConfig: {}, kid: 'bcdefg' })(() => 'Good job!')(request, response)

  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)
  expect(request.jwt).toEqual(JWT_CONTENT)
})
