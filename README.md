_**micro-jwt-jwks-rsa-auth** — [JWT](https://jwt.io/introduction/) authorization wrapper for [Micro](https://github.com/zeit/micro)_

[![Build Status](https://travis-ci.org/mikkorepolainen/micro-jwt-jwks-rsa-auth.svg?branch=master)](https://travis-ci.org/mikkorepolainen/micro-jwt-jwks-rsa-auth)
[![npm](https://img.shields.io/npm/v/micro-jwt-jwks-rsa-auth.svg)](https://www.npmjs.com/package/micro-jwt-jwks-rsa-auth)

## Usage

An `Authorization` header with value `Bearer MY_TOKEN_HERE` is expected to be present in all requests. The decoded token will be available as `req.jwt` after successful authentication for other handlers.

If the token is missing or validation fails, an `Error` will be thrown with the `statusCode` property set to **401**. This is handled automatically by the micro framework, or can be intercepted with error handlers such as [micro-boom](https://github.com/onbjerg/micro-boom).

The wrapper can be configured to validate against either a fixed secret or dynamically using [jwks-rsa](https://github.com/auth0/node-jwks-rsa).

```javascript
const jwtAuth = require('micro-jwt-jwks-rsa-auth')

const auth = jwtAuth({
  secret, // 1
  jwksRsaConfig, // 2, 3
  kid, // 3
  validAudiences,
  whitelist,
  resAuthMissing
  resAuthInvalid,
  resAudInvalid
})

const handler = async(req, res) => { ... } // Your micro logic

module.exports = auth(handler)
```

### Mandatory Configuration Options

 1. Fixed `secret` only (no jwks-rsa)
 2. `jwksRsaConfig` configuration only (`kid` is looked up from request jwt token headers)
 3. `jwksRsaConfig` and fixed `kid` (`kid` on jwt is ignored)

### Optional Configuration Options

 - `validAudiences`: List of audiences considered valid. If omitted, audience is not validated.
 - `whitelist`: List of paths where authentication is not enforced (token will still be decoded if present)
 - `resAuthMissing`: Custom error message for missing authentication header
 - `resAuthInvalid`: Custom error message for invalid token
 - `resAudInvalid`: Custom error message for invalid audience

## Examples

### With Fixed Secret

```javascript
'use strict'

const jwtAuth = require('micro-jwt-jwks-rsa-auth')
const auth = jwtAuth({ secret: 'my_jwt_secret' });

const handler = async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
}

module.exports = auth(handler)
```

### With jwks-rsa Instead of Fixed Secret

```javascript
'use strict'

const jwtAuth = require('micro-jwt-jwks-rsa-auth')
const ms = require('ms')

const jwksRsaConfig = {
  strictSsl: true,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: ms('10h'),
  jwksUri: 'https://<your-auth-domain>/.well-known/jwks.json'
}
const auth = jwtAuth({ jwksRsaConfig: jwksRsaConfig });
// Fixed kid: jwtAuth({ jwksRsaConfig: jwksRsaConfig, kid: 'abcdefg' });

const handler = async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
}

module.exports = auth(handler)

```

### With micro-router

```javascript
'use strict'

const { router, get, post, put, patch, del } = require('microrouter')
const jwtAuth = require('micro-jwt-jwks-rsa-auth')
const auth = jwtAuth(...);

// All routes
const routes = router(
  get('/route1/', handler),
  get('/route2/', handler)
)
module.exports = auth(routes)

// Individual routes
const routes = router(
  get('/route1/', auth(handler)),
  get('/route2/', auth(handler))
)
module.exports = routes
```

## Credits

Most of the code is based on [micro-jwt-auth](https://github.com/kandros/micro-jwt-auth).

## License

[MIT](LICENSE)
