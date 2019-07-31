'use strict';
// Execute tests to verify that whitelists are working
const lambda = require('../index');
const env = require('../env');
const util = require('util');
const fetchMock = require('node-fetch');
const jsonwebtoken = require('jsonwebtoken');

const context = {};
const mockKeys = { COGNITO_JWKS: {"somekey": "somekey"}};

beforeEach(() => {
  fetchMock.reset();
})

test('viewer-response without a new authorization header in request', (done) =>{
  const viewerResponse = {
    Records: [{
      cf: {
        config: {
          distributionDomainName: 'd7123456.cloudfront.net',
          distributionId: 'E0000000',
          eventType: 'viewer-response',
          requestId: 'abcdef0123456789=='
        },
        request: {
          clientIp: '1.1.1.1',
          headers: {
            host: [{
              key: 'Host',
              value: 'my.example.site'
            }],
            referer: [{
              key: 'Referer',
              value: 'https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=abcdef0123456789&redirect_uri=https://my.example.site/&response_type=code&scope=openid+email'
            }]
          },
          method: 'GET',
          querystring: 'code=abcdef0123456789',
          uri: '/'
        },
        response: {
          headers: {
            'accept-ranges': [{
              key: 'Accept-Ranges',
              value: 'bytes'
            }],
            server: [{
              key: 'Server',
              value: 'AmazonS3'
            }],
            age: [{
              key: 'Age',
              value: '17016'
            }],
            'content-type': [{
              key: 'Content-Type',
              value: 'text/html'
            }],
            'content-length': [{
              key: 'Content-Length',
              value: '2045'
            }]
          },
          status: '200',
          statusDescription: 'OK'
        }
      }
    }]
  };

  const expected_result = {
  "headers": {
    "accept-ranges": [{
      "key": "Accept-Ranges",
      "value": "bytes"
    }],
    "age": [{
      "key": "Age",
      "value": "17016"
    }],
    "content-length": [{
      "key": "Content-Length",
      "value": "2045"
    }],
    "content-type": [{
      "key": "Content-Type",
      "value": "text/html"
    }],
    "server": [{
      "key": "Server",
      "value": "AmazonS3"
    }]
  },
  "status": "200",
  "statusDescription": "OK"
};

  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(expected_result);
    done();
  }

  lambda.handler(viewerResponse, context, callback);
});

test('viewer-response with a new authorization header in request', (done) =>{
  var payload = { iat: Math.floor(Date.now() / 1000 ), token_use: "access" };
  var header = { kid: 'somekey' };
  const mytoken = jsonwebtoken.sign(payload, 'somekey', { header: header});

  const viewerResponse = {
    Records: [{
      cf: {
        config: {
          distributionDomainName: 'd7123456.cloudfront.net',
          distributionId: 'E0000000',
          eventType: 'viewer-response',
          requestId: 'abcdef0123456789=='
        },
        request: {
          clientIp: '1.1.1.1',
            headers: {
              host: [{
                key: 'Host',
                value: 'my.example.site'
              }],
              'user-agent': [{
                key: 'User-Agent',
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0'
              }],
              referer: [{
                key: 'Referer',
                value: 'https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=abcdef0123456789&redirect_uri=https://my.example.site/&response_type=code&scope=openid+email'
              }],
              newauthtoken: [{
                key: 'newauthtoken',
                value: mytoken
              }]
          },
          method: 'GET',
          querystring: 'code=abcdef0123456789',
          uri: '/'
        },
        response: {
          headers: {
            'accept-ranges': [{
              key: 'Accept-Ranges',
              value: 'bytes'
            }],
            server: [{
              key: 'Server',
              value: 'AmazonS3'
            }],
            age: [{
              key: 'Age',
              value: '17016'
            }],
            'content-type': [{
              key: 'Content-Type',
              value: 'text/html'
            }],
            'content-length': [{
              key: 'Content-Length',
              value: '2045'
            }]
          },
          status: '200',
          statusDescription: 'OK'
        }
      }
    }]
  };

  const expected_result = {
  "headers": {
    "accept-ranges": [{
      "key": "Accept-Ranges",
      "value": "bytes"
    }],
    "age": [{
      "key": "Age",
      "value": "17016"
    }],
    "content-length": [{
      "key": "Content-Length",
      "value": "2045"
    }],
    "content-type": [{
      "key": "Content-Type",
      "value": "text/html"
    }],
    "server": [{
      "key": "Server",
      "value": "AmazonS3"
    }],
    "set-cookie": [{
      "key": "Set-Cookie",
      "value": "sessiontoken=" + mytoken + ";Path=/;Secure"
    }]
  },
  "status": "200",
  "statusDescription": "OK"
};

  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(expected_result);
    done();
  }

  lambda.handler(viewerResponse, context, callback);
});

test('regular request with authorization header', (done) => {
  var payload = { iat: Math.floor(Date.now() / 1000 ), token_use: "access" };
  var header = { kid: 'somekey' };
  const mytoken = jsonwebtoken.sign(payload, 'somekey', { header: header});
  console.log(jsonwebtoken.decode(mytoken, {complete: true }));

  const requestEvent = {
    "Records": [
      {
        "cf": {
          config: {
            distributionDomainName: 'd7123456.cloudfront.net',
            distributionId: 'E0000000',
            eventType: 'viewer-request',
            requestId: 'abcdef0123456789=='
          },
          "request": {
            "headers": {
              "referer": [{
                "key": "Referer",
                "value": "https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=123456&redirect_uri=https://mywebsite.example.com/&response_type=code&scope=openid+email"
              }]
            },
            "querystring": "authorization=" + mytoken,
            "uri": "/",
            "method": "GET"
          }
        }
      }
    ]
  };

  env.COGNITO_JWKS = { "somekey": "somekey" };
  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(requestEvent.Records[0].cf.request);
    done();
  }

  lambda.handler(requestEvent, context, callback);
});

test('regular request with cookie', (done) => {
  var payload = { iat: Math.floor(Date.now() / 1000 ), token_use: "access" };
  var header = { kid: 'somekey' };
  const mytoken = jsonwebtoken.sign(payload, 'somekey', { header: header});
  console.log(jsonwebtoken.decode(mytoken, {complete: true }));

  const requestEvent = {
  Records: [{
    cf: {
      config: {
        distributionDomainName: 'd7123456.cloudfront.net',
        distributionId: 'E0000000',
        eventType: 'viewer-request',
        requestId: 'abcdef0123456789=='
      },
      request: {
        clientIp: '1.1.1.1',
        headers: {
          host: [{
            key: 'Host',
            value: 'my.example.site'
          }],
          referer: [{
            key: 'Referer',
            value: 'https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=abcdef0123456789&redirect_uri=https://my.example.site/&response_type=code&scope=openid+email'
          }],
          cookie: [{
            key: 'Cookie',
            value: 'sessiontoken=' + mytoken
          }]
        },
        method: 'GET',
        querystring: '',
        uri: '/static/js/main.1234567.chunk.js'
      }
    }
  }]
};
  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(requestEvent.Records[0].cf.request);
    done();
  }

  lambda.handler(requestEvent, context, callback);
});

test('token response path with a valid token response', (done) => {
  const redirected_from_idp = {
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: 'd7123456.cloudfront.net',
            distributionId: 'E0000000',
            eventType: 'viewer-request',
            requestId: 'abcdef0123456789=='
          },
          request: {
            clientIp: '1.1.1.1',
            headers: {
              host: [{
                key: 'Host',
                value: 'my.example.site'
              }],
              referer: [{
                key: 'Referer',
                value: 'https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=abcdef0123456789&redirect_uri=https://my.example.site/&response_type=code&scope=openid+email'
              }],
            },
            querystring: "code=abcdef0123456789",
            uri: env.OAUTH_AUTH_RESPONSE,
            method: "GET"
          }
        }
      }
    ]
  };
  const token_response = { body: { access_token: "abcdef0123456" }, status: 200};
  fetchMock.post("begin:" + env.COGNITO_DOMAIN, token_response);

  const expected_response = {
    clientIp: '1.1.1.1',
    headers: {
      host: [{
        key: 'Host',
        value: 'my.example.site'
      }],
      referer: [{
        key: 'Referer',
        value: 'https://myidp.auth.us-east-1.amazoncognito.com/login?client_id=abcdef0123456789&redirect_uri=https://my.example.site/&response_type=code&scope=openid+email'
      }],
      newauthtoken: [{
        key: 'newauthtoken',
        value: 'abcdef0123456'
      }]
    },
    querystring: 'code=abcdef0123456789',
    uri: '/',
    method: 'GET'
  };

  function callback(err, data) {
    console.log(util.inspect(data, {
      showHidden: false,
      depth: null
    }));
    expect(err).toBeNull();
    expect(data).toEqual(expected_response);
    done();
  }
  lambda.handler(redirected_from_idp, context, callback);
});

test('Ask for an auth protected file and return login redirect', (done) => {
  const privateEvent = {
    "Records": [
      {
        "cf": {
          config: {
            distributionDomainName: 'd7123456.cloudfront.net',
            distributionId: 'E0000000',
            eventType: 'viewer-request',
            requestId: 'abcdef0123456789=='
          },
          "request": {
            "uri": "/index.html",
            "method": "GET",
          }
        }
      }
    ]
  };
  function callback(err, data) {
    expect(err).toBeNull();
    console.log(util.inspect(data, {
      showHidden: false,
      depth: null
    }));
    expect(data.status).toBe(302);
    done();
  }
  lambda.handler(privateEvent, context, callback);
});
