const env = require('./env');
const util = require('util');
var jwt = require('jsonwebtoken');

exports.verifyToken = (jwtToken, callback) => {
  var pems = env.COGNITO_JWKS;

  console.log(util.inspect(pems, {
    showHidden: false,
    depth: null
  }));
  var decodedJwt = jwt.decode(jwtToken, {complete: true});
  console.log(util.inspect(decodedJwt, {
    showHidden: false,
    depth: null
  }));
  if (!decodedJwt) {
      const err = new Error("Not a valid JWT token");
      console.log(err.message);
      callback(err, null);
      return false;
  }

  //Fail if token is not from your UserPool
  // if (decodedJwt.payload.iss != iss) {
  //     const err = new Error("invalid issuer");
  //     console.log(err.message);
  //     callback(err, null);
  //     return false;
  // }

  //Reject the jwt if it's not an 'Access Token'
  if (decodedJwt.payload.token_use != 'access') {
      const err = new Error("Not an access token");
      console.log(err.message);
      callback(err, null);
      return false;
  }

  //Get the kid from the token and retrieve corresponding PEM
  var kid = decodedJwt.header.kid;
  var pem = pems[kid];
  if (!pem) {
      const err = new Error('Invalid access token');
      console.log(err.message);
      callback(err, null);
      return false;
  }

  jwt.verify(jwtToken, pem, { token_use: 'access' }, function(err, payload) {
    if(err) {
      console.log('Token failed verification: ' + err.message);
      callback(err, decodedJwt);
      return false;
    } else {
      //Valid token.
      console.log('Successful verification');
      callback(null, decodedJwt);
      return true;
    }
  });
};
