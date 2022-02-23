const Boom = require('boom');
const clientPackageCtrl = require('./client-package-controller'); // eslint-disable-line
const { requestClientPackageSchema, approveClientPackageSchema, rejectClientPackageSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');
const userDb = require('../user/user-model');

module.exports.requestClientPackage = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const validationError = requestClientPackageSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const createdClientPackage = await clientPackageCtrl.requestClientPackage(body);
    res.json({
      success: true,
      data: createdClientPackage,
      message: responseMessages.clientPackage.SUCCESS_REQUEST_CLIENT_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.approveClientPackage = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = approveClientPackageSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const updatedClientPackage = await clientPackageCtrl.approveClientPackage(body);
    res.json({
      success: true,
      data: updatedClientPackage,
      message: responseMessages.clientPackage.SUCCESS_APPROVE_CLIENT_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.rejectClientPackage = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = rejectClientPackageSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const updatedClientPackage = await clientPackageCtrl.rejectClientPackage(body);
    res.json({
      success: true,
      data: updatedClientPackage,
      message: responseMessages.clientPackage.SUCCESS_REJECT_CLIENT_PACKAGE
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllClientPackages = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser, queryParams } = req;
    const { role, cognitoId } = currentUser;
    if (role === 'admin' || role === 'client-admin' || role === 'client-user') {
      const query = {};
      if (role === 'client-admin' || role === 'client-user') {
        const userData = await userDb.getUserByCognitoId(cognitoId);
        query.client = userData.client;
      }
      if (role === 'admin' && queryParams.client && queryParams.client !== 'all') {
        query.client = queryParams.client;
      }
      const allPackages = await clientPackageCtrl.getAllClientPackages(query);
      res.json({
        success: true,
        data: allPackages,
        message: responseMessages.clientPackage.SUCCESS_GET_ALL_CLIENT_PACKAGE
      });
    } else {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
  } catch (e) {
    return next(e);
  }
}
