'use strict'

const jwtAuth = require('../index')
const VALID_HEADER = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlLCJhdWQiOiJBbGJ1cXVlcnF1ZSJ9.HBEXCw5RPRbMclMIXG-cMIkLgD-hFqIyAyMvgsl6Hgc'
const VALID_HEADER2 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlLCJhdWQiOlsiQWxidXF1ZXJxdWUiLCJOZXcgTWV4aWNvIl19.FGn_pUU8z0zFrLqoTpkBb3XgN4wpJWdtmBPBnJxtqGI'
const INVALID_HEADER = 'Bearer wrong.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhbHRlciBXaGl0ZSIsImFkbWluIjp0cnVlfQ.YyF_yOQsTSQghvM08WBp7VhsHRv-4Ir4eMQvsEycY1A'
const JWT_CONTENT = { sub: '1234567890', name: 'Walter White', admin: true, aud: 'Albuquerque' }
const JWT_CONTENT2 = { sub: '1234567890', name: 'Walter White', admin: true, aud: ['Albuquerque', 'New Mexico'] }

test('error thrown if secret undefined', async () => {
  expect(
    () => jwtAuth({})()
  ).toThrow('micro-jwt-jwks-rsa-auth must be initialized passing either a public key from jwks (secret) or jwks-rsa configuration (jwksRsaConfig) configuration option to decode incoming JWT token')
});

test('case of request has not authorization header', async () => {

  const request = {
    headers: {},
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret' })()(request, response)

  expect(result).toBeUndefined()
  expect(response.writeHead).toHaveBeenCalledWith(401)
  expect(response.end).toHaveBeenCalledWith('Missing Authorization header')
});

test('that all works fine: no errors', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret' })(() => 'Good job!')(request, response)

  expect(request.jwt).toEqual(JWT_CONTENT)
  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)
})

test('wrong bearer case', async () => {

  const request = {
    headers: {
      authorization: INVALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret' })(() => {})(request, response)

  expect(result).toBeUndefined()
  expect(response.writeHead).toHaveBeenCalledWith(401)
  expect(response.end).toHaveBeenCalledWith('Invalid token in Authorization header')

})

test('no need authorization bearer if whitelisted path', async () => {

  const request = {
    headers: {},
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret', whitelist: [ '/domain/resources/1' ] })(() => 'Good job!')(request, response)

  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)

})

test('decode jwt even for whitelisted path', async () => {

  const request = {
    headers: {
      authorization: VALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret', whitelist: [ '/domain/resources/1' ] })(() => 'Good job!')(request, response)

  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)
  expect(request.jwt).toEqual(JWT_CONTENT)
})

test('do not throw error if jwt is invalid for whitelisted path', async () => {

  const request = {
    headers: {
      authorization: INVALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  };

  const result = await jwtAuth({ secret: 'mySecret', whitelist: [ '/domain/resources/1' ] })(() => 'Good job!')(request, response)

  expect(result).toEqual('Good job!')
  expect(response.writeHead).toHaveBeenCalledTimes(0)
  expect(response.end).toHaveBeenCalledTimes(0)
  expect(request.jwt).toBeUndefined()
})

test('custom response, wrong bearer', async () => {

  const request = {
    headers: {
      authorization: INVALID_HEADER
    },
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const customRes = `${Math.random()}`
  const result = await jwtAuth({ secret: 'mySecret', resAuthInvalid: customRes })(() => {})(request, response)

  expect(response.end).toHaveBeenCalledWith(customRes)

})

test('custom response, missing bearer', async () => {

  const request = {
    headers: {},
    url: 'https://api.cabq.gov/domain/resources/1'
  }

  const response = {
    writeHead: jest.fn().mockImplementation(),
    end: jest.fn().mockImplementation()
  }

  const customRes = `${Math.random()}`
  const result = await jwtAuth({ secret: 'mySecret', resAuthMissing: customRes })(() => {})(request, response)

  expect(response.end).toHaveBeenCalledWith(customRes)

})

test('valid audience', async () => {

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

test('valid audiences', async () => {

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

test('invalid audience', async () => {

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

test('invalid audience custom response', async () => {

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
