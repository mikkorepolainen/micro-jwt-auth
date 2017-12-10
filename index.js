'use strict'

const url = require('url')
const jwt = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')

module.exports = exports = (config) => (fn) => {

    let jwksRsaClient = undefined
    if (!config.secret && !config.jwksRsaConfig) {
        throw Error('micro-jwt-jwks-rsa-auth must be initialized passing either a public key from jwks (secret) or jwks-rsa configuration (jwksRsaConfig) configuration option to decode incoming JWT token')
    }
    if (config.jwksRsaConfig && !jwksRsaClient) {
        jwksRsaClient = jwksRsa(config.jwksRsaConfig)
        jwksRsaClient.getSigningKeyAsync = (kid) => {
            return new Promise((resolve, reject) => {
                jwksRsaClient.getSigningKey(kid, (err, key) => {
                    if (err) reject(err)
                    else resolve(key)
                })
            })
        }
    }

    return async (req, res) => {
        const bearerToken = req.headers.authorization
        const pathname = url.parse(req.url).pathname
        const whitelisted = Array.isArray(config.whitelist) && config.whitelist.indexOf(pathname) >= 0

        if (!bearerToken && !whitelisted) {
            res.writeHead(401)
            res.end(config.resAuthMissing || 'Missing Authorization header')
            return
        }

        try {
            const token = bearerToken.replace('Bearer ', '')
            if (jwksRsaClient) {
                const kid = jwt.decode(token, {complete: true}).header.kid
                let key = await jwksRsaClient.getSigningKeyAsync(kid)
                let publicKey = key.publicKey || key.rsaPublicKey
                req.jwt = jwt.verify(token, publicKey)
            }
            else {
                req.jwt = jwt.verify(token, config.secret)
                
            }
        } catch(err) {
            if (!whitelisted) {
              res.writeHead(401)
              res.end(config.resAuthInvalid || 'Invalid token in Authorization header')
              return
            }
        }

        return fn(req, res)
    }
}
