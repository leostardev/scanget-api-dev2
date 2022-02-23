const Boom = require('boom');
const moment = require('moment');
const mongoose = require('mongoose');
const responseMessages = require('../utils/messages');
const communityPointsDB = require('./community-points-model');
const walletDB = require('../wallet/wallet-model');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');
const communityDB = require('../community/community-model');
// const receiptDB = require('../receipt/receipt-model');
const { sendNotification } = require('../utils/notification/notification');
const familyDB = require('../family/family-model');
const walletTransactionDB = require('../wallet-transaction/wallet-transaction-model');
const userDB = require('../user/user-model');

module.exports.getAllCommunityPointsByFamilyId = async (family, queryParams) => {
  try {
    let period = null;
    if (queryParams.minDate && queryParams.maxDate) {
      period = getDateRange(queryParams.minDate, queryParams.maxDate);
    }
    const communityPoints = await communityPointsDB.getAllCommunityPointsByFamilyId(family, period, queryParams.community);
    return communityPoints;
  } catch (error) {
    return Boom.forbidden(responseMessages.communityPoints.ERR_GETTING_COMMUNITY_POINTS);
  }
}

module.exports.redeemCommunityPoints = async (redeemInfo, pointsPerEuro, community, month, info) => {
  try {
    // const settings = await settingsDB.getSettings();
    // if (!settings.pointsPerEuro || settings.pointsPerEuro === 0) {
    //   return Boom.forbidden('No value set for pointsPerEuro');
    // }
    const communityData = await communityDB.getCommunityById(community);
    const response = [];
    const currentMonth = moment().format('MM');
    if (currentMonth === month.toString()) {
      throw Boom.forbidden('Points cannot be redeemed for current month')
    }

    const monthName = moment(month, 'MM').format('MMMM');
    const $promises = [];
    const $pointAdjustmentPromises = []
    const $notificationPromises = [];
    for (let i = 0; i < redeemInfo.length; i++) {
      const amountToAdd = parseInt(redeemInfo[i].points / pointsPerEuro);
      const redeemablePoints = amountToAdd * pointsPerEuro;
      const pointsForAdjustment = redeemInfo[i].points - redeemablePoints;
      const userWallet = await walletDB.getWalletByFamilyId(redeemInfo[i].family);
      if (!userWallet || parseFloat(userWallet.remainingCommunityPoints) < redeemablePoints) {
        response.push({
          family: redeemInfo[i].family.toString(),
          points: redeemInfo[i].points,
          message: 'Not enough points in the wallet',
          success: false
        })
        continue;
      }
      if (redeemablePoints > 0) {
        $promises.push(walletDB.redeemPointsPointsFromFamilyWallet(redeemInfo[i].family, redeemablePoints, amountToAdd));
        const communityPointsTranscationData = {
          family: redeemInfo[i].family,
          points: redeemablePoints,
          action: 'Redeem',
          source: 'ScanNGet',
          info: info || 'Redeem points',
          date: moment(new Date()).utc().toDate(),
          community
        };
        $promises.push(communityPointsDB.createCommunityPoints(communityPointsTranscationData));
        const family = await familyDB.getFamilyById(redeemInfo[i].family, true);
        const notificationContent = {
          dType: 'Points Redeem',
          points: redeemablePoints,
          user: family.familyAdmin
        };
        $notificationPromises.push(sendNotification(notificationContent, 'points.redeem', {}));
        const walletTrasaction = {
          dType: 'points.redeem',
          description: `${communityData ? `${communityData.name} Points` : `Community Points`}`,
          meta: {
            community
          },
          user: family.familyAdmin,
          family: family._id,
          amount: amountToAdd,
          isCredited: true
        }
        await walletTransactionDB.createWalletTransaction(walletTrasaction);
        response.push({
          family: redeemInfo[i].family.toString(),
          points: redeemablePoints,
          message: 'Successfully redeemed points',
          success: true
        })
      }

      if (pointsForAdjustment > 0) {
        const adjustmentPointsForMonth = await communityPointsDB.getAdjustmentPointForSpecificMonth({
          family: redeemInfo[i].family,
          info: `${monthName} points adjustment`,
          action: 'Month-adjustment'
        })
        if (adjustmentPointsForMonth) {
          continue;
        } else {
          const pointsAdjustmentData = {
            family: redeemInfo[i].family,
            source: 'ScanNGet',
            points: pointsForAdjustment,
            info: `${monthName} points adjustment`,
            community,
            action: 'Month-adjustment',
            date: moment(new Date()).utc().toDate()
          }
          $pointAdjustmentPromises.push(communityPointsDB.createCommunityPoints(pointsAdjustmentData))
        }
      }
    }
    await Promise.all($promises);
    await Promise.all($notificationPromises);
    await Promise.all($pointAdjustmentPromises);
    return response;
  } catch (error) {
    throw Boom.forbidden(error.message, error);
  }
}

module.exports.manualCommunityPointsEntry = async (communityPoints) => {
  try {
    const addCommunityPointData = {
      ...communityPoints,
      action: communityPoints.points < 0 ? 'Manual-subtract' : 'Manual-add',
      date: moment(new Date()).utc().toDate()
    };
    await walletDB.submitPointsInFamilyWallet(communityPoints.family, communityPoints.points);
    const family = await familyDB.getFamilyById(communityPoints.family, true);
    const notificationContent = {
      dType: 'Points Adjustment',
      points: communityPoints.points,
      user: family.familyAdmin
    };
    await sendNotification(notificationContent, 'points.adjustment', { source: communityPoints.source && communityPoints.source !== '' ? communityPoints.source : 'ScanNGet', dType: 'Points Adjustment' });
    const data = await communityPointsDB.createCommunityPoints(addCommunityPointData);
    return data;
  } catch (error) {
    return Boom.forbidden(responseMessages.communityPoints.ERR_MANUALLY_UPDATING_COMMUNITY_POINTS, error);
  }
}

module.exports.getCommunityPointsSummary = async (month, year, queryParams) => {
  try {
    const community = queryParams.community;
    const startDate = moment([year, month - 1]).toDate();
    const endDate = moment(startDate).endOf('month').toDate();
    // const query = {
    //   receipt_date: { $gte: startDate, $lte: endDate },
    //   status: 'Accepted'
    // };
    const query = {
      date: { $gte: startDate, $lte: endDate },
      action: { $in: ['Submit', 'Manual-add', 'Month-adjustment'] }
    };
    if (community) {
      query.community = mongoose.Types.ObjectId(community)
    }
    if (queryParams.skip) {
      query.skip = queryParams.skip;
    }
    if (queryParams.limit) {
      query.limit = queryParams.limit;
    }
    // const summary = await receiptDB.getReceiptsForCommunityPointsGroupByFamilyId(query);
    const summaryData = await communityPointsDB.getCommunityPointsGroupedByFamilyId(query, queryParams.search, queryParams.familyAdminId)
    const summary = summaryData.data;
    const modifiedResp = [];
    for (let i = 0; i < summary.length; i++) {
      const item = {
        points: 0,
        family: summary[i].family,
        totalCommunityPoints: 0,
        remainingCommunityPoints: 0,
        redeemedCommunityPoints: 0,
        familyAdmin: summary[i].results && summary[i].results.length > 0 ? {
          _id: summary[i].results[0].familyAdmin._id,
          username: summary[i].results[0].familyAdmin.username,
          email: summary[i].results[0].familyAdmin.email
        } : {},
        details: summary[i].results ? summary[i].results.map(item => {
          return {
            points: item.points,
            action: item.action,
            source: item.source,
            info: item.info,
            quantity: item.quantity,
            date: item.date,
            community: item.community
          }
        }) : []
      }
      for (let j = 0; j < summary[i].results.length; j++) {
        item.points += parseInt(summary[i].results[j].points)
        item.totalCommunityPoints = summary[i].results[j].wallet.totalCommunityPoints
        item.remainingCommunityPoints = summary[i].results[j].wallet.remainingCommunityPoints
        item.redeemedCommunityPoints = summary[i].results[j].wallet.redeemedCommunityPoints
      }
      modifiedResp.push(item);
    }

    return {
      data: modifiedResp,
      total: summaryData.total
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPoints.ERR_GETTING_COMMUNITY_POINTS_SUMMARY);
  }
}

module.exports.getCommunityPointsSummaryCSV = async (month, year, queryParams) => {
  try {
    const community = queryParams.community;
    const startDate = moment([year, month - 1]).toDate();
    const endDate = moment(startDate).endOf('month').toDate();
    // const query = {
    //   receipt_date: { $gte: startDate, $lte: endDate },
    //   status: 'Accepted'
    // };
    const query = {
      date: { $gte: startDate, $lte: endDate },
      action: { $in: ['Submit', 'Manual-add', 'Month-adjustment', 'Manual-subtract'] }
    };
    if (community) {
      query.community = mongoose.Types.ObjectId(community)
    }
    // const summary = await receiptDB.getReceiptsForCommunityPointsGroupByFamilyId(query);
    const summary = await communityPointsDB.getCommunityPointsGroupedByFamilyIdForCSV(query)
    const modifiedResp = [];
    for (let i = 0; i < summary.length; i++) {
      const item = {
        points: 0,
        family: summary[i].family.toString(),
        totalCommunityPoints: 0,
        remainingCommunityPoints: 0,
        redeemedCommunityPoints: 0
      }
      for (let j = 0; j < summary[i].results.length; j++) {
        if (summary[i].results[j].action === 'Manual-subtract' && summary[i].results[j].points > 0) {
          item.points -= parseInt(summary[i].results[j].points)
        } else {
          item.points += parseInt(summary[i].results[j].points)
        }
        item.totalCommunityPoints = summary[i].results[j].wallet.totalCommunityPoints
        item.remainingCommunityPoints = summary[i].results[j].wallet.remainingCommunityPoints
        item.redeemedCommunityPoints = summary[i].results[j].wallet.redeemedCommunityPoints
      }
      modifiedResp.push(item);
    }

    const s3UploadData = await createAndUploadCsvToS3(modifiedResp, `community-points-csv/${Date.now()}/community-points.csv`);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPoints.ERR_GETTING_COMMUNITY_POINTS_SUMMARY);
  }
}

module.exports.getAllCommunityPointsCSV = async () => {
  try {
    // const community = queryParams.community;
    // const startDate = moment([year, month - 1]).toDate();
    // const endDate = moment(startDate).endOf('month').toDate();
    // const query = {
    //   receipt_date: { $gte: startDate, $lte: endDate },
    //   status: 'Accepted'
    // };
    // const query = {
    //   date: { $gte: startDate, $lte: endDate },
    //   action: { $in: ['Submit', 'Manual-add'] }
    // };
    // if (community) {
    //   query.community = mongoose.Types.ObjectId(community)
    // }
    // const summary = await receiptDB.getReceiptsForCommunityPointsGroupByFamilyId(query);
    const communityPoints = await communityPointsDB.getAllCommunityPointsCSV({})
    const modifiedResp = [];
    // 'familyAdmin.family': 1,
    // 'familyAdmin.email': 1,
    // 'familyAdmin.username': 1,
    // 'familyAdmin._id': 1,
    // 'points': 1,
    // 'action': 1,
    // 'source': 1,
    // 'info': 1,
    // 'quantity': 1,
    // 'date': 1,
    // 'community.name': 1,
    // 'community._id': 1,
    // 'createdAt': 1
    for (let i = 0; i < communityPoints.length; i++) {
      const item = {
        date: communityPoints[i].date,
        familyAdminId: communityPoints[i].familyAdmin ? communityPoints[i].familyAdmin._id.toString() : '',
        familyAdminUsername: communityPoints[i].familyAdmin ? communityPoints[i].familyAdmin.username : '',
        familyAdminEmail: communityPoints[i].familyAdmin ? communityPoints[i].familyAdmin.email : '',
        family: communityPoints[i].familyAdmin ? communityPoints[i].familyAdmin.family.toString() : '',
        points: communityPoints[i].points,
        action: communityPoints[i].action,
        source: communityPoints[i].source,
        quantity: communityPoints[i].quantity,
        info: communityPoints[i].info,
        communityId: communityPoints[i].community ? communityPoints[i].community._id.toString() : '',
        communityName: communityPoints[i].community ? communityPoints[i].community.name : '',
        receiptId: communityPoints[i].meta && communityPoints[i].meta.receiptId ? communityPoints[i].meta.receiptId.toString() : ''
      }
      modifiedResp.push(item);
    }

    const s3UploadData = await createAndUploadCsvToS3(modifiedResp, `all-community-points-csv/${Date.now()}/all-community-points.csv`);
    console.log(s3UploadData);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPoints.ERR_GETTING_COMMUNITY_POINTS_SUMMARY);
  }
}

const getDateRange = (minDate, maxDate) => {
  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  const startDate = moment(new Date(minDate)).utc().startOf('day').toDate();
  const endDate = moment(new Date(maxDate)).utc().endOf('day').toDate();
  return { start: startDate, end: endDate };
}

module.exports.getDuplicateAdjustedPoints = async (body) => {
  try {
    const communityPoints = await communityPointsDB.getDuplicateAdjustedPoints(body);
    const $promises = [];
    for (let i = 0; i < communityPoints.length; i++) {
      $promises.push(userDB.getUserByFamilyId(communityPoints[i].family))
    }
    const users = await Promise.all($promises)
    return {
      total: communityPoints.length,
      duplicatedCommunityPointsData: communityPoints,
      affectedUsers: users
    };
  } catch (error) {
    return Boom.forbidden(responseMessages.communityPoints.ERR_GETTING_COMMUNITY_POINTS);
  }
}

module.exports.removeDuplicateAdjustedPoints = async (body) => {
  try {
    const duplicatedPoints = await communityPointsDB.getDuplicateAdjustedPoints(body);
    const $promises = [];
    let deletedCommunityPoints = []
    for (let d = 0; d < duplicatedPoints.length; d++) {
      if (duplicatedPoints[d].count > 1) {
        console.log(duplicatedPoints[d].results[0]._id)
        $promises.push(communityPointsDB.deleteCommunityPoints({ _id: duplicatedPoints[d].results[0]._id }))
      }
    }
    deletedCommunityPoints = await Promise.all($promises)
    return deletedCommunityPoints;
  } catch (error) {
    return Boom.forbidden('Error removing duplicated adjustment points', error);
  }
}
