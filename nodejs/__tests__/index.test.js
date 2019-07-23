// Execute tests to verify that whitelists are working
const lambda = require('../index');

const context = {};
const privateEvent = {
  "Records": [
    {
      "cf": {
        "config": {
          "distributionId": "EXAMPLE"
        },
        "request": {
          "uri": "/index.html",
          "method": "GET",
        }
      }
    }
  ]
}

const publicEvent = {
  "Records": [
    {
      "cf": {
        "config": {
          "distributionId": "EXAMPLE"
        },
        "request": {
          "uri": "/public/index.css",
          "method": "GET",
        }
      }
    }
  ]
}

process.env.WHITELIST= '["/public/*"]';

test('Check if a directory matches whitelist', done => {
  function callback(something, data) {
    console.log(data);
    expect(data.statusCode).toBe(401);
    done();
  }
  lambda.handler(privateEvent, context, callback);
});

test('Check if a directory doesn\'t match whitelist', done => {
  function callback(something, data) {
    console.log(data);
    expect(data.statusCode).toBe(publicEvent.Records[0].request);
    done();
  }
  lambda.handler(publicEvent, context, callback);
});
