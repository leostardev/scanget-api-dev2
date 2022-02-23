const config = require('../../config')
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: config.aws.region,
});
const sns = new AWS.SNS(
  {
    region: config.aws.region
  }
);

module.exports.createCognitoUser = (params) => {
  return cognito.adminCreateUser(params).promise();
}
module.exports.authUser = (params) => {
  return cognito.initiateAuth(params).promise();
}
module.exports.authChallenge = (params) => {
  return cognito.respondToAuthChallenge(params).promise();
}
module.exports.sendConfirmationCode = (params) => {
  return cognito.forgotPassword(params).promise();
}
module.exports.confirmIncomingCode = (params) => {
  return cognito.confirmForgotPassword(params).promise();
}
module.exports.refreshToken = (params) => {
  return cognito.initiateAuth(params).promise();
}
module.exports.sendVerificationCode = (params) => {
  return cognito.getUserAttributeVerificationCode(params).promise();
}
module.exports.verifyCode = (params) => {
  return cognito.verifyUserAttribute(params).promise();
}
module.exports.deactivateCognitoAccount = (params) => {
  return cognito.adminDisableUser(params).promise();
}

module.exports.activateCognitoAccount = (params) => {
  return cognito.adminEnableUser(params).promise();
}
module.exports.sendCodeToUserPhoneNumber = (params) => {
  return new Promise((resolve, reject) => {
    sns.publish(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
}
