'use strict';
const util = require('util');
const {
  URLSearchParams
} = require('url');

exports.handler = (event, context, lambda_return_cb) => {
  console.log(util.inspect(event, {
    showHidden: false,
    depth: null
  }));
  const cfrequest = event.Records[0].cf.request;
  if(cfrequest.uri.endsWith('/')){
    cfrequest.uri = cfrequest.uri + 'index.html'
  }
  else {
    cfrequest.uri = cfrequest.uri + '/index.html'
  }
  console.log(util.inspect(cfrequest, {
    showHidden: false,
    depth: null}));
  lambda_return_cb(null, cfrequest);
  return true;
};
