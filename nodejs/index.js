'use strict';
const util = require('util');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const {
  URLSearchParams
} = require('url');
const querystring = require('querystring');
const env = require('./env');
const jwtCheck = require('./jwt');

// From Michael - sqlbot on StackOverFlow
// Taken from article: https://stackoverflow.com/questions/55128624/cloudfront-lambdaedge-set-cookie-on-viewer-request
function extract_cookie(headers, cname) {
    const cookies = headers['cookie'];
    if(!cookies)
    {
        console.log("extract_cookie(): no 'Cookie:' headers in request");
        return null;
    }

    // iterate through each Cookie header in the request, last to first

    for (var n = cookies.length; n--;)
    {
        // examine all values within each header value, last to first

        const cval = cookies[n].value.split(/;\ /);
        const vlen = cval.length;

        for (var m = vlen; m--;)
        {
            const cookie_kv = cval[m].split('=');
            if(cookie_kv[0] === cname)
            {
                return cookie_kv[1];
            }
        } // for m (each value)
    } // for n (each header)

    // we have no match if we reach this point
    console.log('extract_cookie(): cookies were found, but the specified cookie is absent');
    return null;
}


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
    if (cfrequest.headers.newauthtoken) {
      console.log("Processing a response that needs a cookie set to newauthtoken");
      const access_token = cfrequest.headers.newauthtoken[0].value;
      // Set the auth Cookie
      cfresponse.headers["set-cookie"] = [
        {
          "key": "Set-Cookie",
          "value": "sessiontoken=" + access_token + ";Path=/;Secure"
        }
      ];
      console.log("Returning the cookie with " + util.inspect(cfresponse, {
        showHidden: false,
        depth: null
      }));
    }
    lambda_return_cb(null, cfresponse);
    return true;
  }

  const headers = cfrequest.headers;
  const uri = cfrequest.uri;
  const queryString = cfrequest.querystring;
  var authToken = null;

  const redirect_response = {
    status: 302,
    statusDescription: 'Please authenticate',
    headers: {
      'location': [{
        "value": env.COGNITO_DOMAIN + "/login" +
          "?client_id=" + env.COGNITO_CLIENT_ID +
          "&redirect_uri=" + env.REDIRECT_URI + env.OAUTH_AUTH_RESPONSE +
          "&response_type=code&scope=openid+email"
      }]
    }
  };

  console.log(uri);
  if (queryString) {
    console.log("QueryString detected: " + util.inspect(queryString, {
      showHidden: false,
      depth: null
    }));
    const qsItems = querystring.parse(queryString);
    if (qsItems.code) {
      console.log("Code detected: " + qsItems.code);
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', env.COGNITO_CLIENT_ID);
      params.append('redirect_uri', env.REDIRECT_URI + env.OAUTH_AUTH_RESPONSE);
      params.append('code', qsItems.code);
      const headers = {
        Authorization: 'Basic ' +
          Buffer.from(env.COGNITO_CLIENT_ID + ":" + env.COGNITO_CLIENT_SECRET).toString('base64')
      };

      return fetch(env.COGNITO_DOMAIN + '/oauth2/token', {
          method: 'POST',
          body: params,
          headers: headers
        })
        .then(res => res.json())
        .then(json => {
          console.log("authorization_response received json: " +
            util.inspect(json, {
              showHidden: false,
              depth: null
            })
          );
          cfrequest.headers.newauthtoken = [
            {
              key: "newauthtoken",
              value: json.access_token
            }
          ];
          cfrequest.uri = "/";
          lambda_return_cb(null, cfrequest);
          return true;
        })
        .catch(error => {
          console.log("Error fetching auth code: " + util.inspect(error, {
            showHidden: false,
            depth: null
          }));
          lambda_return_cb(null, redirect_response);
          return true;
        });
    }
    else if(qsItems.authorization) {
      console.log("Authorization parameter matched");
      authToken = qsItems.authorization;
    }
  }
  if(cfrequest.headers) {
    if(authToken === null) {
      authToken = extract_cookie(cfrequest.headers, 'sessiontoken');
    }
    if (authToken === null) {
    // Check for the authorization header
      if (cfrequest.headers.authorization) {
        console.log("Authorization Header present: " +
          util.inspect(cfrequest.headers.authorization, {
            showHidden: false,
            depth: null
          })
        );
        authToken = cfrequest.headers.authorization;
      }
    }
  }
  if (authToken) {
    return jwtCheck.verifyToken(authToken, (err, data) =>{
      if (err) {
        console.log("Authorization required")
        lambda_return_cb(null, redirect_response);
        console.log(util.inspect(redirect_response, {
          showHidden: false,
          depth: null
        }));
        return true;
      }
      else {
        console.log("Authorization Success")
        lambda_return_cb(null, cfrequest);
        console.log(util.inspect(cfrequest, {
          showHidden: false,
          depth: null
        }));
        return true;
      }
    });
  }

  console.log("Authorization required")
  lambda_return_cb(null, redirect_response);
  console.log(util.inspect(redirect_response, {
    showHidden: false,
    depth: null
  }));
  return true;
};
