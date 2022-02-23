const Boom = require('boom');
const communityValueCtrl = require('./community-value-controller');
const { addCommunityValueSchema, updateCommunityValueSchema, deleteCommunityValueSchema, approveCommunityValuesSchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityValue = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addCommunityValueSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.description = body.description.trim();
    body.title = body.title.trim();
    const data = await communityValueCtrl.addCommunityValue(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityValue = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityValueId } = params;
    const validationError = updateCommunityValueSchema({ ...body, communityValueId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    if (body.title) {
      body.title = body.title.trim();
    }
    const data = await communityValueCtrl.updateCommunityValue(body, communityValueId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityValue = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityValueId } = params;
    const validationError = deleteCommunityValueSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityValueCtrl.deleteCommunityValue(communityValueId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getAllCommunityValues = async (req, res, next) => {
  try {
    const data = await communityValueCtrl.getAllCommunityValues();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityValues = async (req, res, next) => {
  try {
    const { params } = req;

    const { communityValueId } = params;
    const validationError = approveCommunityValuesSchema({ communityValueId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityValueCtrl.approveCommunityValue(communityValueId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityValueByCommunityId = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityValueCtrl.getCommunityValueByCommunityId(communityId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}
