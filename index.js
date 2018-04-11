'use strict'

const url = require('url')
const jwt = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')
const { createError } = require('micro')

/**
 * Validate jwt bearer token in request Authorization header.
 *
 * The token will be available as `req.jwt` after successfully decoded.
 *
 * If the token validation fails, an Error will be thrown with the statusCode property set to 401.
 *
 * Configuration options:
 *  - fixed secret only (no jwks-rsa)
 *  - jwksRsaConfig configuration only (kid is looked up from request jwt token)
 *  - jwksRsaConfig and fixed kid (kid on jwt is ignored)
 *
 * @param config {object}
 * @param {string} [config.secret] Fixed secret
 * @param {object} [config.jwksRsaConfig] jwks-rsa configuration object
 * @param {string} [config.kid] jwks-rsa fixed kid
 * @param {string[]} [config.validAudiences] List of audiences considered valid. If omitted, audience is not validated.
 * @param {string[]} [config.whitelist] List of paths where authentication is not enforced (token will still be decoded if present)
 * @param {string} [config.resAuthMissing] Custom error message for missing authentication header
 * @param {string} [config.resAuthInvalid] Custom error message for invalid token
 * @param {string} [config.resAudInvalid] Custom error message for invalid audience
 */
module.exports = exports = (config) => (fn) => {
  let jwksRsaClient
  if (!config || (!config.secret && !config.jwksRsaConfig)) {
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
      throw createError(401, config.resAuthMissing || 'Missing Authorization header')
    }

    try {
      const token = bearerToken.replace('Bearer ', '')
      if (jwksRsaClient) {
        let kid = config.kid || jwt.decode(token, {complete: true}).header.kid
        let key = await jwksRsaClient.getSigningKeyAsync(kid)
        let publicKey = key.publicKey || key.rsaPublicKey
        req.jwt = jwt.verify(token, publicKey)
      } else {
        req.jwt = jwt.verify(token, config.secret)
      }
    } catch (err) {
      if (!whitelisted) {
        throw createError(401, config.resAuthInvalid || 'Invalid token in Authorization header')
      }
    }
    // if (!~req.jwt.aud.indexOf(validAudience)) {
    if (config.validAudiences) {
      let matchingAudiences = config.validAudiences.filter(aud => req.jwt.aud.includes(aud))
      if (matchingAudiences.length === 0) {
        throw createError(401, config.resAudInvalid || 'Invalid audience')
      }
    }

    return fn(req, res)
  }
}
