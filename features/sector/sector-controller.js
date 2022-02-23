const Boom = require('boom');
const sectorDB = require('./sector-model');
const responseMessages = require('../utils/messages');
const dealDB = require('../deal/deal-model');

module.exports.addSector = async sector => {
  try {
    const createdSector = await sectorDB.addSector(sector);
    return createdSector;
  } catch (error) {
    throw Boom.forbidden(responseMessages.sector.ERROR_ADDING_SECTOR, error);
  }
}

module.exports.updateSector = async (updateData, sectorId) => {
  try {
    const updatedSector = await sectorDB.updateSector(updateData, sectorId);
    return updatedSector;
  } catch (error) {
    throw Boom.forbidden(responseMessages.sector.ERROR_UPDATING_SECTOR, error);
  }
}

module.exports.deleteSector = async sectorId => {
  try {
    await sectorDB.deleteSector(sectorId);
    return {
      message: responseMessages.sector.SUCCESS_DELETE_SECTOR
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.sector.ERROR_DELETING_SECTOR, error);
  }
}

module.exports.getAllSectors = async isAdmin => {
  try {
    console.log(isAdmin);
    const allSectors = await sectorDB.getAllSectors();
    if (isAdmin) {
      return allSectors;
    }
    const $promises = [];
    for (let i = 0; i < allSectors.length; i++) {
      $promises.push(dealDB.getDealsCountWrtSectors(allSectors[i]._id));
    }
    const dealsCount = await Promise.all($promises);
    const updatedSectorList = [];
    for (let j = 0; j < dealsCount.length; j++) {
      const category = { ...allSectors[j] };
      if (dealsCount[j] > 0) {
        category.activeDeals = true;
        updatedSectorList.push(category);
      } else {
        category.activeDeals = false;
        updatedSectorList.push(category);
      }
    }
    updatedSectorList.sort((a, b) => {
      const textA = a.name.toUpperCase();
      const textB = b.name.toUpperCase();
      // eslint-disable-next-line no-nested-ternary
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return updatedSectorList;
  } catch (error) {
    throw Boom.forbidden(responseMessages.sector.ERROR_GETTING_ALL_SECTORS, error);
  }
}
