const Boom = require('boom');
const familyCtrl = require('./family-controller');
const { updateFamilyAdminSchema, leaveFamilySchema, updateFamilySchema } = require('../utils/validation');
const userDB = require('../user/user-model');
const ClientSchema = require('../client/client-schema'); // eslint-disable-line
const config = require('../../config');
// const responseMessages = require('../utils/messages');

module.exports.updateFamilyAdmin = async (req, res, next) => {
  try {
    const { body, params, currentUser } = req;
    const { familyId } = params;
    const validationError = updateFamilyAdminSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await familyCtrl.updateFamilyAdmin(body, familyId, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllFamilies = async (req, res, next) => {
  try {
    const data = await familyCtrl.getAllFamilies();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.leaveFamily = async (req, res, next) => {
  try {
    const { body, params, currentUser } = req;
    const { familyId } = params;
    const validationError = leaveFamilySchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const user = userDB.findByMongoId(body.user);
    let data;
    if (user.cognitoId === currentUser.cognitoId) {
      data = await familyCtrl.leaveFamily(body, familyId);
    }

    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getFamilyById = async (req, res, next) => {
  try {
    const { params } = req;
    const { familyId } = params;
    const data = await familyCtrl.getFamilyById(familyId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateFamilyDetails = async (req, res, next) => {
  try {
    const { body, params, currentUser } = req;
    const { familyId } = params;
    const validationError = updateFamilySchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await familyCtrl.updateFamilyData(body, familyId, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllAccountDetails = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await familyCtrl.getAllAccountDetails(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllAccountDetailsCSV = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await familyCtrl.getAllAccountDetailsCSV(queryParams);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${data.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}
