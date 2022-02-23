const Boom = require('boom');
const config = require('../../config');
const communityPointsCtrl = require('./community-points-controller');
const communityDB = require('../community/community-model');
const { redeemCommunityPointsSchema, redeemCommunityPointsItemsSchema, getAllCommunityPointsByFamilyIdSchema, manualCommunityPointsEntrySchema } = require('../utils/validation');

module.exports.getAllCommunityPointsByFamilyId = async (req, res, next) => { // eslint-disable-line
  try {
    const { params, queryParams } = req;
    const validationError = getAllCommunityPointsByFamilyIdSchema({ ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const communityPoints = await communityPointsCtrl.getAllCommunityPointsByFamilyId(params.family, queryParams);
    res.json({
      success: true,
      data: communityPoints
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.redeemCommunityPoints = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;

    let validationError = redeemCommunityPointsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { redeemInfo, community, month, info } = body;
    const communityData = await communityDB.getCommunityById(community);
    if (!communityData) {
      next(Boom.forbidden('Invalid community Id'))
    }
    const pointsPerEuro = communityData.pointsPerEuro;
    for (let m = 0; m < redeemInfo.length; m++) {
      validationError = redeemCommunityPointsItemsSchema(redeemInfo[m]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }
    const communityPoints = await communityPointsCtrl.redeemCommunityPoints(redeemInfo, pointsPerEuro, community, month, info);
    res.json({
      success: true,
      data: communityPoints
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.manualCommunityPointsEntry = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const validationError = manualCommunityPointsEntrySchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const communityPoints = await communityPointsCtrl.manualCommunityPointsEntry(body);
    res.json({
      success: true,
      data: communityPoints
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityPointsSummary = async (req, res, next) => {
  try {
    const { params, queryParams } = req;
    const data = await communityPointsCtrl.getCommunityPointsSummary(params.month, params.year, queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityPointsSummaryCSV = async (req, res, next) => {
  try {
    const { params, queryParams } = req;
    const communitPointsCSV = await communityPointsCtrl.getCommunityPointsSummaryCSV(params.month, params.year, queryParams);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${communitPointsCSV.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllCommunityPointsCSV = async (req, res, next) => {
  try {
    const communitPointsCSV = await communityPointsCtrl.getAllCommunityPointsCSV();
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${communitPointsCSV.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getDuplicateAdjustedPoints = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const duplicatedPoints = await communityPointsCtrl.getDuplicateAdjustedPoints(body);
    res.json({
      success: true,
      data: duplicatedPoints
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.removeDuplicateAdjustedPoints = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const removedDuplicatedPoints = await communityPointsCtrl.removeDuplicateAdjustedPoints(body);
    res.json({
      success: true,
      data: removedDuplicatedPoints
    });
  } catch (e) {
    return next(e);
  }
}
