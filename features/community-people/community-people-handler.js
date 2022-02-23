const Boom = require('boom');
const communityPeopleCtrl = require('./community-people-controller');
const { addCommunityPeopleSchema, updateCommunityPeopleSchema, deleteCommunityPeopleSchema, approveCommunityPeopleSchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityPeople = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addCommunityPeopleSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.description = body.description.trim();
    const data = await communityPeopleCtrl.addCommunityPeople(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityPeople = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityPeopleId } = params;
    const validationError = updateCommunityPeopleSchema({ ...body, communityPeopleId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    const data = await communityPeopleCtrl.updateCommunityPeople(body, communityPeopleId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityPeople = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityPeopleId } = params;
    const validationError = deleteCommunityPeopleSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityPeopleCtrl.deleteCommunityPeople(communityPeopleId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getAllCommunityPeople = async (req, res, next) => {
  try {
    const data = await communityPeopleCtrl.getAllCommunityPeople();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityPeoples = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityPeopleId } = params;
    const validationError = approveCommunityPeopleSchema({ communityPeopleId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityPeopleCtrl.approveCommunityPeople(communityPeopleId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityPeopleByCommunityId = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    let isAdmin = false;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin') {
      isAdmin = true;
    }
    const data = await communityPeopleCtrl.getCommunityPeopleByCommunityId(communityId, isAdmin);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

