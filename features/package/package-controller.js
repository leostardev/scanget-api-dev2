const Boom = require('boom');
const packageDb = require('./package-model');  // eslint-disable-line
const responseMessages = require('../utils/messages');

module.exports.createPackage = async (packageData) => {
  try {
    const newPackage = await packageDb.createPackage(packageData);
    return newPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.package.ERROR_CREATE_PACKAGE, err);
  }
}

module.exports.updatePackageData = async (packageId, updateData) => {
  try {
    const updatedPackage = await packageDb.updatePackageData(packageId, updateData);
    return updatedPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.package.ERROR_UPDATE_PACKAGE, err);
  }
}

module.exports.getAllPackages = async (query) => {
  try {
    const allPackagesData = await packageDb.getAllPackages(query);
    return allPackagesData;
  } catch (err) {
    throw Boom.internal(responseMessages.package.ERROR_GET_ALL_PACKAGE, err);
  }
}
