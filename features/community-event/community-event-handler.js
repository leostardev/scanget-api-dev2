const Boom = require('boom');
const communityEventCtrl = require('./community-event-controller');
const config = require('../../config');
const { addCommunityEventSchema, updateCommunityEventSchema, deleteCommunityEventSchema, approveCommunityEventsSchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityEvent = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addCommunityEventSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    body.description = body.description.trim();
    body.title = body.title.trim();
    const data = await communityEventCtrl.addCommunityEvent(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateCommunityEvent = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityEventId } = params;
    const validationError = updateCommunityEventSchema({ ...body, communityEventId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    if (body.title) {
      body.title = body.title.trim();
    }
    const data = await communityEventCtrl.updateCommunityEvent(body, communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.addUserInterestInCommunityEvent = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId, userId } = params;
    const data = await communityEventCtrl.addUserInterestInCommunityEvent(userId, communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.removeUserInterestInCommunityEvent = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId, userId } = params;
    const data = await communityEventCtrl.removeUserInterestInCommunityEvent(userId, communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.deleteCommunityEvent = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const validationError = deleteCommunityEventSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityEventCtrl.deleteCommunityEvent(communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityEventById = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const data = await communityEventCtrl.getCommunityEventById(communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.getAllCommunityEvents = async (req, res, next) => {
  try {
    const data = await communityEventCtrl.getAllCommunityEvents();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.getCommunityEventsByCommunityId = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityEventCtrl.getCommunityEventsByCommunityId(communityId, currentUser);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.approveCommunityEvents = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const validationError = approveCommunityEventsSchema({ communityEventId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityEventCtrl.approveCommunityEvent(communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.activateCommunityEvents = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const validationError = approveCommunityEventsSchema({ communityEventId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityEventCtrl.activateCommunityEvents(communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
  
}

module.exports.deactivateCommunityEvents = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const validationError = approveCommunityEventsSchema({ communityEventId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityEventCtrl.deactivateCommunityEvents(communityEventId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityEventIntertedPeopleCSV = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityEventId } = params;
    const validationError = approveCommunityEventsSchema({ communityEventId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const communityEventUsersCSV = await communityEventCtrl.getCommunityEventIntertedPeopleCSV(communityEventId);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${communityEventUsersCSV.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}
