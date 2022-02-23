const Boom = require('boom');
const moment = require('moment');
const config = require('../../config')
const presignedUrl = require('../../common/mqtt');
const userDb = require('./user-model');
const responseMessages = require('../utils/messages');
const dealDB = require('../deal/deal-schema'); // eslint-disable-line
const walletDB = require('../wallet/wallet-model');
const notificationCtrl = require('../notification/notification-controller');
const receiptDB = require('../receipt/receipt-model');
const communityPointsDB = require('../community-points/community-points-model');
// const paymentsDB = require('../payment/payment-model');
const familyDB = require('../family/family-model');
const walletTransactionDB = require('../wallet-transaction/wallet-transaction-model');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');
const { sendNotification } = require('../utils/notification/notification');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.create = async userData => {

  try {
    const newUser = await userDb.createUser(userData);
    return newUser;
  } catch (err) {
    throw (err);
  }
}

module.exports.getUserByCognitoId = async cognitoId => {
  let mongoDbUser;
  try {
    mongoDbUser = await userDb.getUserByCognitoId(cognitoId);
    mongoDbUser = formatFavoriteDealResponse(mongoDbUser);
  } catch (error) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_COGNITO_ID, error);
  }
  return mongoDbUser;
}

module.exports.getBySub = async subId => {
  try {
    const ctrlInfo = await userDb
      .fetchByAttribute('sub', subId)
      .then(Users => (Users || [])[0]);
    return ctrlInfo;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_SUB_ID, err);
  }
}

module.exports.updateCognitoAttributes = async (cognitoUserName, body) => {
  const attributes = { ...body };
  if (body.email) {
    attributes.email = body.email;
    attributes.email_verified = 'true';
  }
  try {
    await userDb.updateAttributes(cognitoUserName, attributes);
  } catch (error) {
    throw Boom.forbidden(responseMessages.USER.ERR_UPDATING_USER_ATTRIBUTE, error);
  }
  return getByEmail(cognitoUserName);
}

module.exports.changeUserPassword = async body => {
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

const getByEmail = async email => {
  try {
    const ctrlInfo = await userDb
      .fetchByAttribute('email', email)
      .then(Users => (Users || [])[0]);
    return ctrlInfo;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_ATTRIBUTE, err);
  }
}

module.exports.getByEmail = getByEmail;

module.exports.getByUserId = async id => {
  try {
    const ctrlInfo = await userDb.getByUserId(id)
      .then(Users => (Users || {}));
    return ctrlInfo;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_ID, err);
  }
}

module.exports.getAllUsers = async queryParams => {
  try {
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      queryParams.minDate = moment(new Date(queryParams.minDate)).startOf('day');
      queryParams.maxDate = moment(new Date(queryParams.maxDate)).endOf('day');
    }
    const allUsers = await userDb.getAllUsers(queryParams);
    return allUsers;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_ALL_USERS, err);
  }
}

module.exports.exportUsersToCsv = async queryParams => {
  try {
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      queryParams.minDate = moment(new Date(queryParams.minDate)).startOf('day');
      queryParams.maxDate = moment(new Date(queryParams.maxDate)).endOf('day');
    }
    let allUsers = await userDb.getAllUsersForCSV(queryParams);
    allUsers = allUsers.map((user) => {
      const newData = {
        _id: user._id.toString(),
        sid: user.sid ? user.sid.toString() : '',
        hasUploadedReceipt: user.hasUploadedReceipt,
        language: user.language ? user.language.toString() : '',
        viewedIntro: user.viewedIntro,
        status: user.deactivated ? 'Deactivated' : 'Active',
        phone: user.phone,
        username: user.username.toString(),
        role: user.role.toString(),
        email: user.email.toString(),
        gender: user.gender ? user.gender.toString() : '',
        location: user.location ? user.location.toString() : '',
        year_of_birth: user.year_of_birth ? user.year_of_birth.toString() : '',
        createdAt: moment(user.createdAt).format('DD MMM,YYYY'),
        updatedAt: moment(user.updatedAt).format('DD MMM,YYYY'),
        family: user.family.toString(),
        wallet: {
          balance: user.wallet.balance.toString(),
          savedAmount: user.wallet.savedAmount.toString(),
          amountSpent: user.wallet.amountSpent.toString(),
          totalCommunityPoints: user.wallet.totalCommunityPoints.toString(),
          remainingCommunityPoints: user.wallet.remainingCommunityPoints.toString(),
          redeemedCommunityPoints: user.wallet.redeemedCommunityPoints.toString()
        },
        nationality: user.nationality ? user.nationality.toString() : '',
        referedBy: user.referedBy ? user.referedBy.toString() : ''
      };
      return newData;
    });
    const s3UploadData = await createAndUploadCsvToS3(allUsers, `users-csv/${Date.now()}/users.csv`);
    return s3UploadData;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_ALL_USERS, err);
  }
}

module.exports.getAllAdmins = async () => {
  try {
    const allAdmins = await userDb.getAllAdmins();
    return allAdmins;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_ALL_ADMINS, err);
  }
}
module.exports.updateUserDetails = async (userUpdateData, userEmail, cognitoId) => {
  try {
    if (userUpdateData.username) { // update user name in cognito
      const attributes = {
        username: userUpdateData.username
      };
      await userDb.updateAttributes(userEmail, attributes);
    }
    const mongoDB = await userDb.updateUserDetails(userUpdateData, cognitoId);
    const cognito = await userDb.getUserByCognitoId(cognitoId);
    const userData = {
      cognito,
      mongoDB
    };
    return userData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.USER.ERR_UPDATING_USER_DETAILS, error);
  }
}

const formatFavoriteDealResponse = mongoDBUser => {
  const availedDeals = mongoDBUser.availedDeals.map(availed => availed.deal.toString());
  const favoriteDeals = mongoDBUser.favoriteDeals;
  const updatedDeals = [];
  if (favoriteDeals && favoriteDeals.length > 0) {
    for (let i = 0; i < favoriteDeals.length; i++) {
      if (availedDeals.includes(favoriteDeals[i]._id.toString())) {
        updatedDeals.push({
          ...favoriteDeals[i],
          isAvailed: true
        });
      } else {
        updatedDeals.push({
          ...favoriteDeals[i],
          isAvailed: true
        });
      }
    }
  }
  mongoDBUser.favoriteDeals = updatedDeals;
  return mongoDBUser;
}
module.exports.addWalletToUserDetails = async (cognitoId, walletId) => {
  try {
    await userDb.updateUserDetails({ wallet: walletId }, cognitoId);
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_ID, err);
  }
}

module.exports.rewardBonusToUsers = async rewards => {
  try {
    const $promises = [];
    const $walletTransactionsPromises = [];
    for (let i = 0; i < rewards.length; i++) {
      $promises.push(walletDB.updateAmountToWalletByUserId(rewards[i].user, rewards[i].amount, 0))
      const notificationData = {
        user: rewards[i].user,
        notificationType: rewards[i].notificationType,
        description: rewards[i].description,
        forAllUsers: false
      };
      $promises.push(notificationCtrl.createNotification(notificationData))
      $walletTransactionsPromises.push(addWalletTransaction(rewards[i]))
    }
    await Promise.all($promises);
    return;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_ALL_ADMINS, err);
  }
}

module.exports.getTopRawardableUsers = async queryParams => {
  try {
    let startDate;
    let endDate;
    if (queryParams.month) {
      const monthNumber = parseInt(queryParams.month, 10);
      startDate = moment([(new Date()).getFullYear(), monthNumber - 1]).startOf('day').toDate();
      endDate = moment(startDate).endOf('month').endOf('day').toDate();
    } else {
      const currentDate = new Date();
      startDate = moment([currentDate.getFullYear(), currentDate.getMonth()]).startOf('day').toDate();
      endDate = moment(startDate).endOf('month').endOf('day').toDate();
    }
    const users = await receiptDB.getTopRawardableUsers(startDate, endDate);
    return users;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REWARDABLE_USERS, err);
  }
}

module.exports.getUsersFavoriteDeals = async user => {
  try {
    const favoriteDeals = await userDb.getUsersFavoriteDeals(user);
    return { favoriteDeals };
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REWARDABLE_USERS, err);
  }
}

module.exports.viewedIntro = async user => {
  try {
    await userDb.updateUserDetails({ viewedIntro: true }, user);
    return {};
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REWARDABLE_USERS, err);
  }
}

module.exports.registerPushNotificationDevice = async body => {
  try {
    const updateData = {
      $addToSet: {
        pushIds: body.deviceId
      },
      lastLogin: moment(new Date()).utc().toDate(),
      deviceInfo: body.deviceInfo
    };
    await userDb.updateUserDetails(updateData, body.userId);
    return {};
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REGISTERING_DEVICE, err);
  }
}

module.exports.removePushNotificationDevice = async body => {
  try {
    const updateData = {
      $pull: {
        pushIds: body.deviceId
      }
    };
    await userDb.updateUserDetails(updateData, body.userId);
    return {};
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REMOVING_DEVICE, err);
  }
}

module.exports.uploadImageToS3 = async body => {
  try {
    const uploadData = await userDb.uploadImageToS3(body);
    return uploadData;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_UPLOADING_IMAGE, err);
  }
};

module.exports.addCommunityPointsToUserFromCSV = async body => {
  try {
    let { pointsData, source } = body;
    if (!source || source === '') {
      source = 'ScanNGet';
    }
    const $pointsAddPromises = [];
    const $notificationPromises = []
    for (let i = 0; i < pointsData.length; i++) {
      const infoForCommunityPoints = `${pointsData[i].points} points adjustment has been done by ${source}`
      $pointsAddPromises.push(walletDB.submitPointsInFamilyWalletByUserIdAndAddTransaction(pointsData[i]._id, pointsData[i].points, source, infoForCommunityPoints, pointsData[i].community));
      const notificationContent = {
        dType: 'Points Adjustment',
        points: pointsData[i].points,
        user: pointsData[i]._id
      };
      $notificationPromises.push(sendNotification(notificationContent, 'points.adjustment', { source: source && source !== '' ? source : 'ScanNGet', dType: 'Points Adjustment' }));
    }
    const updateData = await Promise.all($pointsAddPromises);
    const notificationData = await Promise.all($notificationPromises);
    return { updateData, notificationData };
  } catch (err) {
    throw Boom.forbidden('Error adding points to user wallet from CSV', err);
  }
};

module.exports.getUserHistory = async userId => {
  try {
    const responseData = {};

    const userData = await userDb.getByUserId(userId, true);
    const userFamilyId = userData.family;

    const userFamily = await familyDB.getFamilyById(userFamilyId, true)
    const userWallet = await walletDB.getWalletByFamilyId(userData.family)

    responseData.totalOutstandingBalance = parseFloat(userWallet.balance).toFixed(2);
    responseData.totalSavingAmount = parseFloat(userWallet.savedAmount).toFixed(2);
    responseData.totalAmountSpent = parseFloat(userWallet.amountSpent).toFixed(2);

    responseData.totalCommunityPoints = userWallet.totalCommunityPoints;
    responseData.remainingCommunityPoints = userWallet.remainingCommunityPoints;
    responseData.redeemedCommunityPoints = userWallet.redeemedCommunityPoints;

    const $promises = [
      receiptDB.getUserReceiptsByFamilyIdGroupedByStatus(userFamilyId),
      communityPointsDB.getAllCommunityPointsByFamilyId(userFamilyId),
      // paymentsDB.getAllPaymentsOfUser(userFamly.familyAdmin),
      // receiptDB.getUserPaymentFromReceipts(userFamly.familyAdmin),
      walletTransactionDB.getAllWalletTransactions({ user: userFamily.familyAdmin })
    ];

    const dataResp = await Promise.all($promises);

    responseData.receiptsSummary = dataResp[0];

    responseData.pointsHistory = dataResp[1];

    responseData.paymentsHistory = dataResp[2].sort((a, b) => ((a.createdAt < b.createdAt) ? 1 : ((b.createdAt < a.createdAt) ? -1 : 0)));

    return responseData;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_GETTING_USER_HISTORY, err);
  }
}

module.exports.getActiveUsers = async (numberOfDays, queryParams) => {
  try {
    const dateQuery = {
      maxDate: moment().utc().toDate(),
      minDate: moment().utc().subtract(`${numberOfDays}`, 'days').toDate()
    }

    const usersData = await userDb.getActiveUsersCountWrtReceipts(dateQuery, queryParams)

    return usersData;
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_GETTING_ACTIVE_USERS_COUNT, err);
  }
}

module.exports.getPresignedUrl = (key) => {
  return new Promise((resolve, reject) => {
    // const date = moment().format('YYYYMMDD-hhmm');
    const params = { Bucket: config.assetsS3Bucket, ContentType: 'image/jpeg', Key: key };
    s3.getSignedUrl('putObject', params, (err, presignedUrl) => {
      if (err) {
        reject(err)
      } else {
        console.log('Your generated pre-signed URL is', presignedUrl);
        resolve({
          presignedUrl,
          imageUrl: `${config.s3BucketCDN}/${key}`
        })
      }
    });
  })
}

function addWalletTransaction(data) {
  return new Promise(async (resolve) => {
    const user = await userDb.getByUserId(data.user, true);
    await walletTransactionDB.createWalletTransaction({
      dType: 'reward.bonus',
      description: data.description,
      meta: {},
      user: user._id,
      family: user.family,
      amount: data.anount,
      isCredited: true
    })
    resolve();
  })
}

module.exports.getMqttUrlForIOTEvents = async () => {
  try {
    const url = await presignedUrl.getMqttUrl();
    return { url };
  } catch (err) {
    throw Boom.forbidden(responseMessages.USER.ERR_REWARDABLE_USERS, err);
  }
}
