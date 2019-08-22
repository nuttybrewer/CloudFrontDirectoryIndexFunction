'use strict';
const util = require('util');
const {
  URLSearchParams
} = require('url');
const env = require('./env');

exports.handler = (event, context, lambda_return_cb) => {
  console.log(util.inspect(event, {
    showHidden: false,
    depth: null
  }));
  const cfresponse = event.Records[0].cf.response;
  const cfrequest = event.Records[0].cf.request;

  // Check if this is a response event
  if (event.Records[0].cf.config.eventType === 'viewer-response') {
    console.log('Processing a response');
    lambda_return_cb(null, cfresponse);
    return true;
  }
  lambda_return_cb(null, cfresponse);
  return true;
};
