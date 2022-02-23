const Boom = require('boom');
const moment = require('moment');
const clientPackageDb = require('./client-package-model');  // eslint-disable-line
const responseMessages = require('../utils/messages');
const packageDb = require('../package/package-model');

module.exports.requestClientPackage = async (body) => {
  try {
    let { startDate } = body;
    const { clientId, packageId } = body;
    const packageData = await packageDb.getPackageById(packageId);
    const {
      slots, banners, cost, duration
    } = packageData;
    startDate = moment(startDate).utc().startOf('day').toDate();
    const endDate = moment(startDate).add((7 * duration) - 1, 'days').utc().endOf('day').toDate();
    const clientPackageData = {
      slots,
      banners,
      cost,
      startDate,
      client: clientId,
      package: packageId,
      endDate,
      packageMeta: {
        slots,
        banners,
        cost,
        duration,
        startDate,
        endDate
      }
    };
    const newClientPackage = await clientPackageDb.requestClientPackage(clientPackageData);
    return newClientPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.clientPackage.ERROR_APPROVE_CLIENT_PACKAGE, err);
  }
}

module.exports.approveClientPackage = async (body) => {
  try {
    let { startDate } = body;
    const {
      clientPackageId, slots, banners, cost, duration
    } = body;
    const clientPackageData = await clientPackageDb.getClientPackageById(clientPackageId);
    // const packageId = clientPackageData.package;
    // const packageData = await packageDb.getPackageById(packageId);
    const clientPackageUpdateData = {
      status: 'Approved',
      packageMeta: clientPackageData.packageMeta
    };
    if (startDate) {
      startDate = moment(startDate).utc().startOf('day');
      clientPackageUpdateData.startDate = startDate;
      clientPackageUpdateData.endDate = moment(startDate).add((7 * duration) - 1, 'days').utc().endOf('day');
      clientPackageUpdateData.packageMeta.startDate = startDate;
      clientPackageUpdateData.packageMeta.endDate = moment(startDate).add((7 * duration) - 1, 'days').utc().endOf('day');
    }
    if (slots) {
      clientPackageUpdateData.slots = slots;
      clientPackageUpdateData.packageMeta.slots = slots;
    }
    if (banners) {
      clientPackageUpdateData.banners = banners;
      clientPackageUpdateData.packageMeta.banners = banners;
    }
    if (cost) {
      clientPackageUpdateData.cost = cost;
      clientPackageUpdateData.packageMeta.cost = cost;
    }
    if (duration) {
      clientPackageUpdateData.duration = duration;
      clientPackageUpdateData.packageMeta.duration = duration;
    }
    const newClientPackage = await clientPackageDb.updateClientPackage(clientPackageId, clientPackageUpdateData);
    return newClientPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.clientPackage.ERROR_APPROVE_CLIENT_PACKAGE, err);
  }
}

module.exports.rejectClientPackage = async (body) => {
  try {
    const { clientPackageId, reason } = body;
    const clientPackageUpdateData = {
      reason,
      status: 'Rejected'
    };
    const newClientPackage = await clientPackageDb.updateClientPackage(clientPackageId, clientPackageUpdateData);
    return newClientPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.clientPackage.ERROR_REJECT_CLIENT_PACKAGE, err);
  }
}

module.exports.updateClientPackageData = async (packageId, updateData) => {
  try {
    const updatedClientPackage = await clientPackageDb.updateClientPackageData(packageId, updateData);
    return updatedClientPackage;
  } catch (err) {
    throw Boom.internal(responseMessages.clientPackage.ERROR_UPDATE_PACKAGE, err);
  }
}

module.exports.getAllClientPackages = async (query) => {
  try {
    const allClientPackagesData = await clientPackageDb.getAllClientPackages(query);
    return allClientPackagesData;
  } catch (err) {
    throw Boom.internal(responseMessages.clientPackage.ERROR_GET_ALL_CLIENT_PACKAGE, err);
  }
}
