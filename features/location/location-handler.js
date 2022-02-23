const Boom = require('boom');
const locationCtrl = require('./location-controller');
const { addLocationSchema, updateLocationSchema, deleteLocationSchema } = require('../utils/validation');

module.exports.addLocation = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addLocationSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await locationCtrl.addLocation(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
module.exports.updateLocation = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { locationId } = params;
    const validationError = updateLocationSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await locationCtrl.updateLocation(body, locationId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteLocation = async (req, res, next) => {
  try {
    const { params } = req;
    const { locationId } = params;
    const validationError = deleteLocationSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await locationCtrl.deleteLocation(locationId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllLocations = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await locationCtrl.getAllLocations(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
