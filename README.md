[![Build Status](https://travis-ci.org/mikkorepolainen/micro-jwt-auth.svg?branch=master)](https://travis-ci.org/mikkorepolainen/micro-jwt-auth)
<!-- [![npm](https://img.shields.io/npm/v/micro-jwt-auth.svg)](https://www.npmjs.com/package/micro-jwt-auth) -->
# micro-jwt-auth
[json web token(jwt)](https://jwt.io/introduction/) authorization wrapper for [Micro](https://github.com/zeit/micro)
with the option to use [jwks-rsa](https://www.npmjs.com/package/jwks-rsa) ([node-jwks-rsa](https://github.com/auth0/node-jwks-rsa)) instead of a fixed secret

> An `Authorization` header with value `Bearer MY_TOKEN_HERE` is expected

## examples

#### with no other wrappers
```javascript
'use strict'

const jwtAuth = require('micro-jwt-auth')

/*
    if Authorization Bearer is not present or not valid, return 401
*/

module.exports = jwtAuth({ secret: 'my_jwt_secret' })(async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
})
```

#### with multiple wrappers

```javascript
'use strict'

const jwtAuth = require('micro-jwt-auth')

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const handle = async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
}

module.exports = compose(
    jwtAuth({ secret: process.env.jwt_secret }),
    anotherWrapper,
    analitycsWrapper,
    redirectWrapper,
    yetAnotherWrapper
)(handle)
```

#### with whitelist of paths
Whitelisted paths make JWT token *optional*. However if valid token is provided it will be  decoded.

```javascript
'use strict'

const jwtAuth = require('micro-jwt-auth')

/*
    Bypass authentication for login route
*/

module.exports = jwtAuth({ secret: 'my_jwt_secret',
  whitelist: [ 'api/login' ]
})(async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
})
```

#### with custom responses

```javascript
'use strict'

const jwtAuth = require('micro-jwt-auth')

/*
    You can overwrite the default response with the optional config object
*/

module.exports = jwtAuth({ secret: 'my_jwt_secret',
  whitelist: [ 'api/login' ], 
  resAuthInvalid: 'Error: Invalid authentication token',
  resAuthMissing: 'Error: Missing authentication token'
})(async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
})

/*
  You may skip the whitelist if unnecessary
*/

module.exports = jwtAuth({ secret: 'my_jwt_secret',
  resAuthInvalid: 'Error: Invalid authentication token',
  resAuthMissing: 'Error: Missing authentication token'
})(async(req, res) => {
  return `Ciaone ${req.jwt.username}!`
})
```

#### with jwks-rsa instead of fixed secret

```javascript
'use strict'

const jwtAuth = require('micro-jwt-auth')
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

/*
  With micro-router
*/
const { router, get, post, put, patch, del } = require('microrouter')

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

