const Boom = require('boom');
const communityIntroductionCtrl = require('./community-introduction-controller');
const { addCommunityIntroductionSchema, updateCommunityIntroductionSchema, deleteCommunityIntroductionSchema, approveCommunityIntroductionSchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityIntroduction = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addCommunityIntroductionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.description = body.description.trim();
    const data = await communityIntroductionCtrl.addCommunityIntroduction(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityIntroduction = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityIntroductionId } = params;
    const validationError = updateCommunityIntroductionSchema({ ...body, communityIntroductionId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    const data = await communityIntroductionCtrl.updateCommunityIntroduction(body, communityIntroductionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityIntroduction = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityIntroductionId } = params;
    const validationError = deleteCommunityIntroductionSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityIntroductionCtrl.deleteCommunityIntroduction(communityIntroductionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getAllCommunityIntroduction = async (req, res, next) => {
  try {
    const data = await communityIntroductionCtrl.getAllCommunityIntroduction();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityIntroduction = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityIntroductionId } = params;
    const validationError = approveCommunityIntroductionSchema({ communityIntroductionId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityIntroductionCtrl.approveCommunityIntroduction(communityIntroductionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityIntroductionByCommunityId = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityIntroductionCtrl.getCommunityIntroductionByCommunityId(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}
