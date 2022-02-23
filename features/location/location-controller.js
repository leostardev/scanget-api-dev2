const Boom = require('boom');
const locationDB = require('./location-model');
const responseMessages = require('../utils/messages');

module.exports.addLocation = async (location) => {
  try {
    const alreadyAddedLocation = await locationDB.getLocationByName(location.name);
    if (alreadyAddedLocation.length > 0) {
      throw Boom.forbidden(responseMessages.location.SAME_LOCATION_NAME_EXIST);
    }
    const createdLocation = locationDB.addLocation(location);
    return createdLocation;
  } catch (error) {
    throw Boom.forbidden(responseMessages.location.ERROR_ADDING_LOCATION, error);
  }
}

module.exports.updateLocation = async (updateData, locationId) => {
  try {
    if (updateData.name) {
      const alreadyAddedCategory = await locationDB.getLocationByName(updateData.name);
      if (alreadyAddedCategory.length > 0) {
        throw Boom.forbidden(responseMessages.location.SAME_LOCATION_NAME_EXIST);
      }
    }
    const updatedLocation = await locationDB.updateLocation(updateData, locationId);
    return updatedLocation;
  } catch (error) {
    throw Boom.forbidden(responseMessages.location.ERROR_UPDATING_LOCATION, error);
  }
}

module.exports.deleteLocation = async (locationId) => {
  try {
    await locationDB.deleteLocation(locationId);
    return {
      message: responseMessages.location.SUCCESS_DELETE_LOCATION
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.location.ERROR_DELETING_LOCATION, error);
  }
}

module.exports.getAllLocations = async (params) => {
  try {
    const query = {};
    if (params.language) {
      query.language = params.language;
    }
    const allLocations = await locationDB.getAllLocations(query);
    return allLocations;
  } catch (error) {
    throw Boom.forbidden(responseMessages.location.ERROR_GETTING_ALL_LOCATIONS, error);
  }
}
