const Boom = require('boom');
const dashboardCtrl = require('./dashboard-controller');
const { overallStatusSchema, getDashboardDatav1Schema, getDashboardDatav2Schema } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.getOverallStatus = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const validationError = overallStatusSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dashboardCtrl.getOverallStatus(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getDashboardDatav1 = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const validationError = getDashboardDatav1Schema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dashboardCtrl.getDashboardDatav1(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getDashboardDatav2 = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const validationError = getDashboardDatav2Schema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dashboardCtrl.getDashboardDatav2(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
// module.exports.getUsersRegistrationTrend= async (req, res, next) =>  {
//   
// 
//   
//   try {
//     const { body, currentUser } = req;
//     if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
//       throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
//     }
//     const validationError = getUsersRegistrationTrendSchema(body);
//     if (validationError) {
//       throw Boom.badRequest(validationError);
//     }
//     const data = await dashboardCtrl.getUsersRegistrationTrend(body);
//         res.json({
//   success: true,
//   data
// });
//   } catch (e) {
//     return next(e);
//   }
// 
// }
