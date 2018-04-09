module.exports = exports = (config) => {
  // console.log("Using mock version of the jwks-rsa node module")
  return {
    getSigningKey: (kid, callback) => { // (err, key)
      console.log(kid)
      if (kid == "bcdefg") callback(undefined, { publicKey: 'mySecret2' })
      else if (kid == "abcdef") callback(undefined, { publicKey: 'mySecret' })
      else throw Error("Invalid kid")
    }
  }
}