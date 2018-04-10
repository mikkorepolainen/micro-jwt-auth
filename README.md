[![Build Status](https://travis-ci.org/mikkorepolainen/micro-jwt-jwks-rsa-auth.svg?branch=master)](https://travis-ci.org/mikkorepolainen/micro-jwt-jwks-rsa-auth)
<!-- [![npm](https://img.shields.io/npm/v/micro-jwt-jwks-rsa-auth.svg)](https://www.npmjs.com/package/micro-jwt-jwks-rsa-auth) -->
# micro-jwt-jwks-rsa-auth
[json web token(jwt)](https://jwt.io/introduction/) authorization wrapper for [Micro](https://github.com/zeit/micro)
with the option to use [jwks-rsa](https://www.npmjs.com/package/jwks-rsa) ([node-jwks-rsa](https://github.com/auth0/node-jwks-rsa)) instead of a fixed secret.
Based on [micro-jwt-auth](https://github.com/kandros/micro-jwt-auth).

> An `Authorization` header with value `Bearer MY_TOKEN_HERE` is expected

## Usage

```javascript
const jwtAuth = require('micro-jwt-jwks-rsa-auth')

const auth = jwtAuth({
  secret,
  jwksRsaConfig,
  kid,
  validAudiences,
  whitelist,
  resAuthMissing
  resAuthInvalid,
  resAudInvalid
})

const handler = async(req, res) => { ... } // Your micro logic

module.exports = auth(handler)
```

The token will be available as `req.jwt` after successfully decoded.

If the token validation fails, an Error will be thrown with the statusCode property set to 401.

### Three ways of operation

 - fixed `secret` only (no jwks-rsa)
 - `jwksRsaConfig` configuration only (`kid` is looked up from request jwt token headers)
 - `jwksRsaConfig` and fixed `kid` (`kid` on jwt is ignored)

### Optional Configuration Options

 - `validAudiences`: List of audiences considered valid. If omitted, audience is not validated.
 - `whitelist`: List of paths where authentication is not enforced (token will still be decoded if present)
 - `resAuthMissing`: Custom error message for missing authentication header
 - `resAuthInvalid`: Custom error message for invalid token
 - `resAudInvalid`: Custom error message for invalid audience

## Examples

#### With Fixed Secret

```javascript
'use strict'

const jwtAuth = require('micro-jwt-jwks-rsa-auth')
const auth = jwtAuth({ secret: 'my_jwt_secret' });

const handler = async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
}

module.exports = auth(handler)
```

#### With jwks-rsa Instead of Fixed Secret

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

#### With micro-router

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

