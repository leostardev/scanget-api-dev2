const Boom = require('boom');
const packageCtrl = require('./package-controller'); // eslint-disable-line
const { createPackageSchema, updatePackageSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.createPackage = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const validationError = createPackageSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const createdPackage = await packageCtrl.createPackage(body);
    res.json({
      success: true,
      data: createdPackage,
      message: responseMessages.package.SUCCESS_CREATE_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivatePackage = async (req, res, next) => {
  try {
    const { params } = req;
    const { packageId } = params;
    const updatedPackage = await packageCtrl.updatePackageData(packageId, { active: false });
    res.json({
      success: true,
      data: updatedPackage,
      message: responseMessages.package.SUCCESS_DEACTIVATE_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activatePackage = async (req, res, next) => {
  try {
    const { params } = req;
    const { packageId } = params;
    const updatedPackage = await packageCtrl.updatePackageData(packageId, { active: true });
    res.json({
      success: true,
      data: updatedPackage,
      message: responseMessages.package.SUCCESS_ACTIVATE_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updatePackage = async (req, res, next) => { // eslint-disable-line
  try {
    const { body, params } = req;
    const { packageId } = params;
    const validationError = updatePackageSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const updatedPackageData = await packageCtrl.updatePackageData(packageId, body);
    res.json({
      success: true,
      data: updatedPackageData,
      message: responseMessages.package.SUCCESS_UPDATE_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllPackages = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      const query = {};
      if (currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
        query.active = true;
      }
      const allPackages = await packageCtrl.getAllPackages(query);
      res.json({
        success: true,
        data: allPackages,
        message: responseMessages.package.SUCCESS_GET_ALL_PACKAGE
      });
    } else {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
  } catch (e) {
    return next(e);
  }
}
