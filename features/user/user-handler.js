const Boom = require('boom');
const config = require('../../config');
const userCtrl = require('./user-controller');
const { checkUserUpdateSchema, viewedIntroSchema, addAdminSchema, rewardBonusSchema, rewardBonusBasicSchema, getUsersFavoriteDealsSchema, registerPushNotificationDeviceSchema, uploadImageToS3Schema, addCommunityPointsToUserFromCSVSchema, getPresignedUrlSchema } = require('../utils/validation');
const authCtrl = require('../authentication/authentication-controller');
const settingsDB = require('../settings/settings-model');

module.exports.getUserDetails = async (req, res, next) => { // eslint-disable-line
  let IdToken;
  try {
    if (req && req.headers && req.headers.Authorization) {
      IdToken = req.headers.Authorization;
    }
    const { currentUser } = req;
    const cognito = await userCtrl.getBySub(currentUser.cognitoId);
    const mongoDB = await userCtrl.getUserByCognitoId(currentUser.cognitoId);
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
    let inviteBonus = 0;
    let redeemDate = null;
    const settings = await settingsDB.getSettings();
    if (settings) {
      inviteBonus = settings.inviteCreatorBonus;
      redeemDate = settings.redeemDate;
    }
    delete cognito._meta;
    const userData = {
      cognito,
      mongoDB,
      uploadConfigs,
      inviteBonus,
      redeemDate
    };
    res.json({
      success: true,
      data: userData
    });
  } catch (e) {
    return next(e);
  }
}

// eslint-disable-next-line space-before-blocks
module.exports.updateUserDetails = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = checkUserUpdateSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await userCtrl.updateUserDetails(body, currentUser.email, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await userCtrl.getAllUsers(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.exportUsersToCsv = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await userCtrl.exportUsersToCsv(queryParams);

    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${data.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.addAdmin = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addAdminSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.role = 'admin';
    const data = await authCtrl.signUpUser(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllAdmins = async (req, res, next) => {
  try {
    const data = await userCtrl.getAllAdmins();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.rewardBonusToUsers = async (req, res, next) => {
  try {
    const { body } = req;
    let validationError = rewardBonusBasicSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    for (let i = 0; i < body.rewards.length; i++) {
      validationError = rewardBonusSchema(body.rewards[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }
    const data = await userCtrl.rewardBonusToUsers(body.rewards);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getTopRawardableUsers = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await userCtrl.getTopRawardableUsers(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getUsersFavoriteDeals = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = getUsersFavoriteDealsSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await userCtrl.getUsersFavoriteDeals(params.userId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.viewedIntro = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = viewedIntroSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    await userCtrl.viewedIntro(params.userId);
    res.json({
      success: true,
      data: {}
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.registerPushNotificationDevice = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = registerPushNotificationDeviceSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const data = await userCtrl.registerPushNotificationDevice(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.removePushNotificationDevice = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = registerPushNotificationDeviceSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const data = await userCtrl.removePushNotificationDevice(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.uploadImageToS3 = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = uploadImageToS3Schema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await userCtrl.uploadImageToS3(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
};

module.exports.addCommunityPointsToUserFromCSV = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addCommunityPointsToUserFromCSVSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await userCtrl.addCommunityPointsToUserFromCSV(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getUserHistory = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = getUsersFavoriteDealsSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await userCtrl.getUserHistory(params.userId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getActiveUsers = async (req, res, next) => {
  try {
    const numberOfDays = parseInt(req.params.days || 7);
    const queryParams = req.queryParams;
    const data = await userCtrl.getActiveUsers(numberOfDays, queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getPresignedUrl = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = getPresignedUrlSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const $promises = [userCtrl.getPresignedUrl(body.key)];
    if (body.thumbnailKey) {
      $promises.push(userCtrl.getPresignedUrl(body.thumbnailKey));
    }
    const data = await Promise.all($promises);
    let thumbnailPresignedUrl = null
    if (body.thumbnailKey) {
      thumbnailPresignedUrl = data[1].presignedUrl;
    }
    res.json({
      success: true,
      data: {
        ...data[0],
        thumbnailPresignedUrl
      }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getMqttUrlForIOTEvents = async (req, res, next) => {
  try {
    const data = await userCtrl.getMqttUrlForIOTEvents();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
