const Boom = require('boom');
const communityHistoryCtrl = require('./community-history-controller');
const { addCommunityHistorySchema, updateCommunityHistorySchema, deleteCommunityHistorySchema, approveCommunityHistorySchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityHistory = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addCommunityHistorySchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.description = body.description.trim();
    const data = await communityHistoryCtrl.addCommunityHistory(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityHistory = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityHistoryId } = params;
    const validationError = updateCommunityHistorySchema({ ...body, communityHistoryId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    const data = await communityHistoryCtrl.updateCommunityHistory(body, communityHistoryId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityHistory = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityHistoryId } = params;
    const validationError = deleteCommunityHistorySchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityHistoryCtrl.deleteCommunityHistory(communityHistoryId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getAllCommunityHistories = async (req, res, next) => {
  try {
    const data = await communityHistoryCtrl.getAllCommunityHistories();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityHistories = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityHistoryId } = params;
    const validationError = approveCommunityHistorySchema({ communityHistoryId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityHistoryCtrl.approveCommunityHistory(communityHistoryId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityHistoryByCommunityId = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityHistoryCtrl.getCommunityHistoryByCommunityId(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}
