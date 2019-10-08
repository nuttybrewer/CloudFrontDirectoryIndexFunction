'use strict';
// Execute tests to verify that whitelists are working
const lambda = require('../index');

const context = {};

test('Folder request ending in slash', (done) =>{
  const viewerResponse = {
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
            }]
          },
          method: 'GET',
          uri: 'github/'
        }
      }
    }]
  };

  const expected_result = {
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
      uri: 'github/index.html'

};

  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(expected_result);
    done();
  }

  lambda.handler(viewerResponse, context, callback);
});

test('Folder request not ending in slash', (done) =>{
  const viewerResponse = {
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
            }]
          },
          method: 'GET',
          uri: 'github'
        }
      }
    }]
  };

  const expected_result = {
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
      uri: 'github/index.html'

};

  function callback(err, data) {
    expect(err).toBeNull();
    expect(data).toEqual(expected_result);
    done();
  }

  lambda.handler(viewerResponse, context, callback);
});
