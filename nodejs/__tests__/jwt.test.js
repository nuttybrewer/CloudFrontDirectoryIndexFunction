const jwt = require('../jwt.js');
const jsonwebtoken = require('jsonwebtoken');

beforeEach(() => {
  jest.resetModules();
});

test('JWT', (done) => {
  // Set up mocked up JWT access token
  var payload = { iat: Math.floor(Date.now() / 1000 ), token_use: "access" };
  var header = { kid: 'somekey' };
  const mytoken = jsonwebtoken.sign(payload, 'somekey', { header: header});
  console.log(jsonwebtoken.decode(mytoken, {complete: true }));

  function callback(err, data) {
    done();
  }
  jwt.verifyToken(mytoken, callback);
});
