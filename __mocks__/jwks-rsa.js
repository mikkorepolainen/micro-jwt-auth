module.exports = exports = (config) => {
  // console.log("Using mock version of the jwks-rsa node module")
  return {
    getSigningKey: (kid, callback) => { // (err, key)
      callback(undefined, { publicKey: 'mySecret' })
    }
  }
}