const Boom = require('boom');
const communityCtrl = require('./community-controller');
const { createCommunitySchema, updateCommunitySchema, deleteCommunitySchema, approveCommunitySchema, getCommunityByShortIdSchema } = require('../utils/validation');

module.exports.createCommunity = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = createCommunitySchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.createCommunity(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateCommunity = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityId } = params;
    const validationError = updateCommunitySchema({ ...body, communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.updateCommunity(body, communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteCommunity = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = deleteCommunitySchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.deleteCommunity(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllCommunities = async (req, res, next) => {
  try {
    let data;
    const { currentUser } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin') {
      data = await communityCtrl.getAllCommunitiesForAdmin();
    } else {
      data = await communityCtrl.getAllCommunities();
    }

    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityByClientId = async (req, res, next) => {
  try {
    const { params } = req;
    const data = await communityCtrl.getAllCommunitiesByClientId(params.clientId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityById = async (req, res, next) => {
  try {
    const { params } = req;
    const data = await communityCtrl.getCommunityById(params.communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.approveCommunity = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = approveCommunitySchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.approveCommunity(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activateCommunity = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = approveCommunitySchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.activateCommunity(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateCommunity = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = approveCommunitySchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.deactivateCommunity(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityByShortId = async (req, res, next) => {
  try {
    const { params } = req;
    const { communitySid } = params;
    const validationError = getCommunityByShortIdSchema({ communitySid });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityCtrl.getCommunityByShortId(communitySid);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
