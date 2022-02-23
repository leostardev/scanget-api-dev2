const Boom = require('boom');
const periodCtrl = require('./period-controller'); // eslint-disable-line
const { generatePeriodsSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.generatePeriods = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const validationError = generatePeriodsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const createdPeriod = await periodCtrl.generatePeriods(body);
    res.json({
      success: true,
      data: createdPeriod,
      message: responseMessages.period.SUCCESS_GENERATE_PERIODS
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivatePeriod = async (req, res, next) => {
  try {
    const { params } = req;
    const { periodId } = params;
    const updatedPeriod = await periodCtrl.updatePeriodData(periodId, { available: false });
    res.json({
      success: true,
      data: updatedPeriod,
      message: responseMessages.period.SUCCESS_DEACTIVATE_PERIOD
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activatePeriod = async (req, res, next) => {
  try {
    const { params } = req;
    const { periodId } = params;
    const updatedPeriod = await periodCtrl.updatePeriodData(periodId, { available: true });
    res.json({
      success: true,
      data: updatedPeriod,
      message: responseMessages.period.SUCCESS_ACTIVATE_PERIOD
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllPeriods = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser, queryParams } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      const query = {};
      if (queryParams.year) {
        query.year = parseInt(queryParams.year, 10);
      }
      if (currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
        query.available = true;
        // query.startDate = {
        //   $gt: new Date()
        // };
      }
      const allPeriods = await periodCtrl.getAllPeriods(query);
      res.json({
        success: true,
        data: allPeriods,
        message: responseMessages.period.SUCCESS_GET_ALL_PERIOD
      });
    } else {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllAvailablePeriods = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser, queryParams } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      const query = {
        available: true
      };
      if (queryParams.year) {
        query.year = parseInt(queryParams.year, 10);
      }
      if (currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
        query.available = true;
      }
      const allPeriods = await periodCtrl.getAllAvailablePeriods(query);
      res.json({
        success: true,
        data: allPeriods,
        message: responseMessages.period.SUCCESS_GET_ALL_PERIOD
      });
    } else {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
  } catch (e) {
    return next(e);
  }
}

module.exports.revertPeriodDates = async (req, res, next) => { // eslint-disable-line
  try {
    const allPeriods = await periodCtrl.revertPEriodDaysBy1Day(2020, 1);
    res.json({
      success: true,
      data: allPeriods,
      message: 'Success fix'
    });
  } catch (e) {
    return next(e);
  }
}
