const { path, pathOr } = require('ramda');
const user = require('../user/user-model');

const parseCognitoUser = rawUser => {
  return rawUser;
}

module.exports.parseCognitoUser = parseCognitoUser;

module.exports.parseAPIGatewayEvent = async event => {
  let data = {};

  if (event.body !== '') {
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      console.error('Error occur during parsing request body', e);
      data = {};
    }
  }
  let currentUser = parseCognitoUser(pathOr({}, ['requestContext', 'authorizer', 'claims'], event));
  if (currentUser && currentUser['cognito:username']) {
    const freshCognitoUser = await user.getByCognitoUsername(currentUser['cognito:username']);
    currentUser = {
      ...currentUser,
      ...freshCognitoUser
    };
  }

  // const url = `${event.httpMethod}${event.resource}`;
  // const visit = {
  //   uid: currentUser.username,
  //   cid: currentUser.userId,
  //   dp: url,
  //   dh: event.headers.Host,
  //   uip: event.requestContext.identity.sourceIp,
  //   ua: event.headers['user-agent'],
  //   dr: event.headers.referrer || event.headers.referer,
  //   de: event.headers['accept-encoding'],
  //   ul: event.headers['accept-language']
  // };
  // const visitor = ua(process.env.GA_TRACKING_ID, currentUser.username, { strictCidFormat: false });
  // visitor.pageview(visit).send();

  return {
    body: data,
    path: path(['requestContext', 'resourcePath'], event),
    httpMethod: path(['requestContext', 'httpMethod'], event),
    stage: path(['requestContext', 'stage'], event),
    currentUser,
    params: event.pathParameters || event.path,
    queryParams: (event.queryStringParameters || event.query) || {},
    cognitoPoolClaims: event.cognitoPoolClaims,
    headers: event.headers
  };
}

module.exports.parseCognitoEvent = event => {
  return {
    attributes: path(['request', 'userAttributes'], event),
    cognitoUserName: event.userName,
    userPoolId: event.userPoolId,
    validationData: path(['request', 'validationData'], event) || {}
  };
}

module.exports.parseSNSEvent = event => {
  const sns = path(['Records', 0, 'Sns'], event);
  let message;

  try {
    message = JSON.parse(path(['Message'], sns));
  } catch (e) {
    message = {};
  }

  return {
    message,
    attributes: path(['MessageAttributes'], sns)
  };
}

