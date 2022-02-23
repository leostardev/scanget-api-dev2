// let jwt = require('jsonwebtoken');
let config = require('../config');
const Boom = require('boom');
let https = require('https');
let jose = require('node-jose');
const responseMessages = require('../features/utils/messages');

exports.verifyUser = (req, res, next) => {
  let region = config.aws.region;
  let userPoolId = config.cognitoPoolId;
  let appClientId = config.cognitoClientId;

  let keysUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  let token = req.header('Authorization');
  if (!token && req.body && req.body.Authorization) {
    token = req.body.Authorization;
  }
  if (token) {
    let sections = token.split('.');
    // get the kid from the headers prior to verification
    let header = jose.util.base64url.decode(sections[0]);

    header = JSON.parse(header);
    let kid = header.kid;
    // download the public keys
    https.get(keysUrl, function (response) {
      if (response.statusCode === 200) {
        response.on('data', function (body) {
          let keys = JSON.parse(body)['keys'];
          // search for the kid in the downloaded public keys
          let keyIndex = -1;
          for (let i = 0; i < keys.length; i++) {
            if (kid === keys[i].kid) {
              keyIndex = i;
              break;
            }
          }
          if (keyIndex === -1) {
            next(Boom.unauthorized('Public key not found in jwks.json'));
          }
          // construct the public key
          try {

            jose.JWK.asKey(keys[keyIndex]).
              then(function (result) {
                // verify the signature
                jose.JWS.createVerify(result).
                  verify(token).
                  then(function (data) {
                    // now we can use the claims
                    let claims = JSON.parse(data.payload);
                    // additionally we can verify the token expiration
                    let currentTs = Math.floor(new Date() / 1000);
                    if (currentTs > claims.exp) {
                      next(Boom.unauthorized('Token is expired'));
                    }
                    // and the Audience (use claims.client_id if verifying an access token)
                    if (claims.aud !== appClientId) {
                      next(Boom.unauthorized('Token was not issued for this audience'));
                    }
                    let user = claims;
                    delete user.auth_time;
                    delete user.token_use;
                    delete user.event_id;
                    delete user.iat;
                    delete user.exp;
                    delete user.iss;
                    req.currentUser = {
                      ...user,
                      cognitoId: user.sub,
                      username: user['cognito:username'],
                      clientId: user.aud,
                      role: user['custom:role']
                    };
                    next();
                  }).
                  catch(function (err) {
                    next(Boom.unauthorized('Signature verification failed', err));
                  });
              })
          } catch (error) {
            next(Boom.unauthorized('Signature verification failed', error))
          }
        });
      }
    }); 
  } else {
    next(Boom.unauthorized('Missing Authorization token'));
  }
};

exports.verifyAdmin = (req, res, next) => {
  let region = config.aws.region;
  let userPoolId = config.cognitoPoolId;
  let appClientId = config.cognitoClientId;

  let keysUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const token = req.header('Authorization');
  let sections = token.split('.');
  // get the kid from the headers prior to verification
  let header = jose.util.base64url.decode(sections[0]);

  header = JSON.parse(header);
  let kid = header.kid;
  // download the public keys
  https.get(keysUrl, function (response) {
    if (response.statusCode === 200) {
      response.on('data', function (body) {
        let keys = JSON.parse(body)['keys'];
        // search for the kid in the downloaded public keys
        let keyIndex = -1;
        for (let i = 0; i < keys.length; i++) {
          if (kid === keys[i].kid) {
            keyIndex = i;
            break;
          }
        }
        if (keyIndex === -1) {
          next(Boom.unauthorized('Public key not found in jwks.json'));
        }
        // construct the public key
        jose.JWK.asKey(keys[keyIndex]).
          then(function (result) {
            // verify the signature
            jose.JWS.createVerify(result).
              verify(token).
              then(function (data) {
                // now we can use the claims
                let claims = JSON.parse(data.payload);
                // additionally we can verify the token expiration
                let currentTs = Math.floor(new Date() / 1000);
                if (currentTs > claims.exp) {
                  next(Boom.unauthorized('Token is expired'));
                }
                // and the Audience (use claims.client_id if verifying an access token)
                if (claims.aud !== appClientId) {
                  next(Boom.unauthorized('Token was not issued for this audience'));
                }
                let user = claims;
                if (user['custom:role'] && user['custom:role'] === 'admin') {
                  delete user.auth_time;
                  delete user.token_use;
                  delete user.event_id;
                  delete user.iat;
                  delete user.exp;
                  delete user.iss;
                  req.currentUser = {
                    ...user,
                    userId: user.sub,
                    username: user.preferred_username,
                    clientId: user.aud,
                    role: user['custom:role']
                  };
                  next();
                } else {
                  next(Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED));
                }
              }).
              catch(function (err) {
                next(Boom.unauthorized('Signature verification failed', err));
              });
          });
      });
    }
  });
};

exports.verifyAdminOrClientAdmin = (req, res, next) => {
  let region = config.aws.region;
  let userPoolId = config.cognitoPoolId;
  let appClientId = config.cognitoClientId;

  let keysUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const token = req.header('Authorization');
  let sections = token.split('.');
  // get the kid from the headers prior to verification
  let header = jose.util.base64url.decode(sections[0]);

  header = JSON.parse(header);
  let kid = header.kid;
  // download the public keys
  https.get(keysUrl, function (response) {
    if (response.statusCode === 200) {
      response.on('data', function (body) {
        let keys = JSON.parse(body)['keys'];
        // search for the kid in the downloaded public keys
        let keyIndex = -1;
        for (let i = 0; i < keys.length; i++) {
          if (kid === keys[i].kid) {
            keyIndex = i;
            break;
          }
        }
        if (keyIndex === -1) {
          next(Boom.unauthorized('Public key not found in jwks.json'));
        }
        // construct the public key
        jose.JWK.asKey(keys[keyIndex]).
          then(function (result) {
            // verify the signature
            jose.JWS.createVerify(result).
              verify(token).
              then(function (data) {
                // now we can use the claims
                let claims = JSON.parse(data.payload);
                // additionally we can verify the token expiration
                let currentTs = Math.floor(new Date() / 1000);
                if (currentTs > claims.exp) {
                  next(Boom.unauthorized('Token is expired'));
                }
                // and the Audience (use claims.client_id if verifying an access token)
                if (claims.aud !== appClientId) {
                  next(Boom.unauthorized('Token was not issued for this audience'));
                }
                let user = claims;
                if (user['custom:role'] && (user['custom:role'] === 'admin' || user['custom:role'] === 'client-admin')) {
                  delete user.auth_time;
                  delete user.token_use;
                  delete user.event_id;
                  delete user.iat;
                  delete user.exp;
                  delete user.iss;
                  req.currentUser = {
                    ...user,
                    userId: user.sub,
                    username: user.preferred_username,
                    clientId: user.aud,
                    role: user['custom:role']
                  };
                  next();
                } else {
                  next(Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED));
                }
              }).
              catch(function (err) {
                next(Boom.unauthorized('Signature verification failed', err));
              });
          });
      });
    }
  });
};
