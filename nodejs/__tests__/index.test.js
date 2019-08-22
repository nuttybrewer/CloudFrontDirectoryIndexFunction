'use strict';
// Execute tests to verify that whitelists are working
const lambda = require('../index');
const env = require('../env');
const util = require('util');
const fetchMock = require('node-fetch');

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
