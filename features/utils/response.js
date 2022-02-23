const serializeError = require('serialize-error');
// const Raven = require('raven');
// const log = require('utils/log');

// Raven.config(process.env.RAVEN_CONFIG, {
//   release: '1.3.0'
// }).install();

function buildResponse(statusCode, data, message, isSuccess, noCache) {
  const body = JSON.stringify({
    data,
    message,
    success: isSuccess
  });
  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body
  };
  if (noCache) {
    response.headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
    response.headers['Expires'] = '-1'; // eslint-disable-line
    response.headers['Pragma'] = 'no-cache'; // eslint-disable-line
  }
  return response;
}

module.exports.success = (body, isCreated, message, noCache) => {
  return buildResponse(isCreated ? 201 : 200, body, message, true, noCache);
}

// function reportToRaven(err, event) {
//   if (event && event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
//     delete event.requestContext.authorizer.claims['custom:pincode'];
//     // Raven.setContext({
//     //   user: event.requestContext.authorizer.claims
//     // });
//   }
//   return new Promise((resolve) => {
//     resolve();
//   });
// }

module.exports.failure = err => {
  // await reportToRaven(err, event);
  // if (boom.isBoom(err)) {
  //   // console.log('BOOM ERROR');
  //   // console.log(err);
  //   return buildResponse(err.output.statusCode, err, err.data ? err.data.message : err.output.payload.message, false);
  // }
  // console.log('JS ERROR');
  // console.log(err);
  const serializedErr = serializeError(err);
  // console.log('JS serialized ERROR');
  // console.log(serializedErr);
  let errMessage;
  if (serializedErr && serializedErr.message) {
    errMessage = serializedErr.message;
  }

  return buildResponse(500, JSON.stringify(serializedErr), errMessage ? errMessage : serializedErr); // eslint-disable-line 
}
