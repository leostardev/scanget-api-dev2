const Boom = require('boom');
const config = require('../../config')
const randomatic = require('randomatic');
const authDb = require('./authentication-model');
const responseMessages = require('../utils/messages');
const userCtrl = require('../user/user-controller');
const userDb = require('../user/user-model');
const settingsDB = require('../settings/settings-model');
const clientSchema = require('../client/client-schema'); // eslint-disable-line
const PhoneNumberSchema = require('./phone-number-verify-schema');

module.exports.signInUser = async (body) => {
  let authData;
  try {
    const { email, password } = body;
    try {
      authData = await initiateAuth(email, password);
    } catch (error) {
      if (error.message === 'User is disabled.') {
        throw Boom.forbidden(error.message, error);
      }
      throw Boom.forbidden(responseMessages.AUTH.INITIATE_AUTH_ERR, error);
    }
    const { AuthenticationResult } = authData;
    const { AccessToken, RefreshToken, IdToken } = AuthenticationResult;

    const uploadConfigs = {
      cognito: {
        IdentityPoolId: config.identityPoolId,
        RoleArn: config.roleArn,
        Logins: {
        }
      },
      s3: config.assetsS3Bucket,
      region: config.aws.region,
      cdn: config.s3BucketCDN
    };
    uploadConfigs.cognito.Logins[`${config.loginUploadConfig}`] = IdToken;
    let cognitoUser;
    try {
      cognitoUser = await userCtrl.getByEmail(email);
      delete cognitoUser._meta;
    } catch (error) {
      throw Boom.notFound(responseMessages.AUTH.GET_BY_USERNAME_ERR, error);
    }
    let mongoDBUser;
    try {
      mongoDBUser = await userCtrl.getUserByCognitoId(cognitoUser.cognitoId);
    } catch (error) {
      throw Boom.notFound(responseMessages.AUTH.GET_BY_COGNITO_ID_ERR, error);
    }
    let inviteBonus = 0;
    let redeemDate = null;
    const settings = await settingsDB.getSettings();
    if (settings) {
      inviteBonus = settings.inviteCreatorBonus;
      redeemDate = settings.redeemDate;
    }
    const currentUser = {
      cognito: cognitoUser,
      mongoDB: mongoDBUser,
      TokenContainer: {
        AccessToken, RefreshToken, IdToken
      },
      uploadConfigs,
      inviteBonus,
      redeemDate
    };
    return currentUser;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports.signUpUser = async (body) => {
  try {
    // Check if mongodb is alive
    await userDb.fetchRandom();
    const {
      username, email, password, phone, gender, location, role, language, year_of_birth, _id, client, phoneCode, countryCode
    } = body;
    const preferredUsername = username;
    const UserAttributes = [
      {
        Name: 'preferred_username',
        Value: preferredUsername
      },
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'email_verified',
        Value: 'true'
      }
    ];
    if (role) {
      UserAttributes.push({
        Name: 'custom:role',
        Value: body.role
      });
    }
    const params = {
      UserPoolId: config.cognitoPoolId, /* required */
      Username: `${body.email}`, /* required */
      TemporaryPassword: password,
      UserAttributes,
      ValidationData: [
        {
          Name: 'pureUserName',
          Value: preferredUsername
        },
      ],
      MessageAction: 'SUPPRESS', // new account is created please verofy.
    };

    let signupData;
    try {
      signupData = await authDb.createCognitoUser(params);
    } catch (error) {
      if (error.message.includes('username')) {
        throw Boom.notAcceptable(responseMessages.AUTH.ALREADY_EXIST_USERNAME, error);
      } else if (error.message.includes('User account already exists')) {
        throw Boom.notAcceptable(responseMessages.AUTH.ALREADY_EXIST_EMAIL, error);
      } else {
        throw Boom.notAcceptable(responseMessages.AUTH.PRE_SIGNUP_ERR, error);
      }
    }
    const UserId = signupData.User.Attributes[0].Value;
    let authData;
    try {
      authData = await initiateAuth(email, password);
    } catch (error) {
      throw Boom.forbidden(responseMessages.AUTH.INITIATE_AUTH_ERR, error);
    }
    let tokenContainer;
    try {
      tokenContainer = await respondToAuthChallenge(authData.ChallengeName, authData.Session, password, params.Username);
    } catch (error) {
      throw Boom.forbidden(responseMessages.AUTH.RESPOND_AUTH_CHALLENGE_ERR, error);
    }
    const { AuthenticationResult } = tokenContainer;
    const { AccessToken, RefreshToken, IdToken } = AuthenticationResult;
    let userData;
    try {
      userData = await userCtrl.getBySub(UserId);
      delete userData._meta;
    } catch (error) {
      throw Boom.notFound(responseMessages.AUTH.GET_BY_SUB_ERR, error);
    }

    const mongoUserData = {
      ...userData,
      phone,
      phoneCode,
      countryCode,
      gender,
      location,
      role,
      language,
      year_of_birth,
      _id,
      client
    };
    const mongoDBUser = await userCtrl.create(mongoUserData);
    const userDetails = {
      cognito: userData,
      mongoDB: mongoDBUser,
      TokenContainer: {
        AccessToken, RefreshToken, IdToken
      }
    };
    return userDetails;
  } catch (err) {
    throw err;
  }
}

module.exports.resetPassword = async ({ email }) => {
  let wantedUser;
  try {
    wantedUser = await userCtrl.getByEmail(email);
  } catch (error) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_PREFERRED, error);
  }

  if (!wantedUser) {
    throw Boom.notFound(responseMessages.USER.USER_DOESNT_EXIST);
  }

  const params = {
    // UserPoolId: config.COGNITO_POOL_ID, /* required */
    Username: email /* required */,
    ClientId: config.cognitoClientId
  };
  return authDb.sendConfirmationCode(params);
}

module.exports.deactivateAccount = (email, cognitoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deactivateAccountParams = {
        UserPoolId: config.cognitoPoolId,
        Username: email
      };
      await authDb.deactivateCognitoAccount(deactivateAccountParams);
      await userDb.deactivateMongoAccount(cognitoId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports.deactivateAccountByMongoId = (mongoId, noFamily) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, cognitoId } = await userDb.getByUserId(mongoId, noFamily);
      const deactivateAccountParams = {
        UserPoolId: config.cognitoPoolId,
        Username: email
      };
      await authDb.deactivateCognitoAccount(deactivateAccountParams);
      await userDb.deactivateMongoAccount(cognitoId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports.activateAccount = (email, cognitoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const activateAccountParams = {
        UserPoolId: config.cognitoPoolId,
        Username: email
      };
      await authDb.activateCognitoAccount(activateAccountParams);
      await userDb.activateMongoAccount(cognitoId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports.activateAccountByMongoId = (mongoId, noFamily) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, cognitoId } = await userDb.getByUserId(mongoId, noFamily);
      const deactivateAccountParams = {
        UserPoolId: config.cognitoPoolId,
        Username: email
      };
      await authDb.activateCognitoAccount(deactivateAccountParams);
      await userDb.activateMongoAccount(cognitoId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

const initiateAuth = (username, password) => {
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH', /* required */
    ClientId: config.cognitoClientId, /* required */
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  return authDb.authUser(params);
}

module.exports.initiateAuth = initiateAuth;

const respondToAuthChallenge = (challengeName, session, newPass, username) => {
  const params = {
    ChallengeName: challengeName, /* required */
    ClientId: config.cognitoClientId, /* required */
    ChallengeResponses: {
      NEW_PASSWORD: newPass,
      USERNAME: username
    },
    Session: session
  };
  return authDb.authChallenge(params);
}
module.exports.respondToAuthChallenge = respondToAuthChallenge;

module.exports.verifyPin = (body) => {
  const { email, password, code } = body;
  const params = {
    ClientId: config.cognitoClientId, /* required */
    ConfirmationCode: code, /* required */
    Password: password, /* required */
    Username: email, /* required */
  };
  return authDb.confirmIncomingCode(params);
}

module.exports.changeUserPassword = async (body) => {
  const { token, oldPassword, newPassword } = body;
  const params = {
    AccessToken: token, /* required */
    PreviousPassword: oldPassword, /* required */
    ProposedPassword: newPassword /* required */

  };
  try {
    await userDb.changePassword(params);
  } catch (error) {
    throw Boom.forbidden(responseMessages.USER.ERR_UPDATING_PASSWORD, error);
  }
}

module.exports.refreshToken = async (body) => {
  const { refreshToken } = body;
  const params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: config.cognitoClientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken
    }
  };
  let authData;
  try {
    authData = await authDb.refreshToken(params);
  } catch (error) {
    throw Boom.forbidden(error);
  }
  const { AuthenticationResult } = authData;
  const { AccessToken, IdToken } = AuthenticationResult;
  const uploadConfigs = {
    cognito: {
      IdentityPoolId: config.identityPoolId,
      RoleArn: config.roleArn,
      Logins: {
      }
    },
    s3: config.assetsS3Bucket,
    region: config.aws.region,
    cdn: config.s3BucketCDN
  };
  uploadConfigs.cognito.Logins[`${config.loginUploadConfig}`] = IdToken;
  const responseData = {
    AccessToken,
    IdToken,
    uploadConfigs
  };
  return responseData;
}
module.exports.sendVerificationCode = (body) => {
  const { accessToken } = body;
  const params = {
    AccessToken: accessToken,
    AttributeName: 'email'
  };
  const code = authDb.sendVerificationCode(params);
  return code;
}

module.exports.verifyCode = (body) => {
  const { code, accessToken } = body;
  const params = {
    AccessToken: accessToken,
    AttributeName: 'email',
    Code: code
  };
  const verifyData = authDb.verifyCode(params);
  return verifyData;
}

module.exports.sendPhoneNumberVerificationCode = async (phoneNumber) => {
  const code = randomatic('0', 6);
  const params = {
    Message: `Your phone number verification code is: ${code}`, /* required */
    PhoneNumber: phoneNumber
  };
  await authDb.sendCodeToUserPhoneNumber(params);
  const isPhoneNumberExists = await checkPhoneNumberExistance(phoneNumber);
  const phoneNumberVerifyData = await addPhoneNumberVerification({ code, phoneNumber }, !!isPhoneNumberExists);
  return phoneNumberVerifyData;
}

module.exports.verifyPhoneCode = async (body) => {
  const userPhoneVerificationStatus = await getPhoneNumberVerification(body);
  return !!userPhoneVerificationStatus;
}

const addPhoneNumberVerification = (data, doUpdate) => {
  return new Promise((resolve, reject) => {
    if (doUpdate) {
      PhoneNumberSchema.findOneAndUpdate({ phoneNumber: data.phoneNumber }, data, { new: true }, (err, updatedVerification) => {
        if (err) {
          reject(err);
        }
        resolve(updatedVerification);
      });
    } else {
      const phoneNumberVerify = new PhoneNumberSchema(data);
      phoneNumberVerify.save((err, createdVerfication) => {
        if (err) {
          reject(err);
        }
        resolve(createdVerfication);
      });
    }
  });
}

const getPhoneNumberVerification = (query) => {
  return new Promise((resolve, reject) => {
    PhoneNumberSchema.findOne(query, (err, verification) => {
      if (err) {
        reject(err);
      }
      resolve(verification);
    });
  });
}

const checkPhoneNumberExistance = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    PhoneNumberSchema.findOne({ phoneNumber }, (err, verification) => {
      if (err) {
        reject(err);
      }
      resolve(verification);
    });
  });
}
