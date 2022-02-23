const Boom = require('boom');
const sectorCtrl = require('./sector-controller');
const { addSectorItemsSchema, updateSectorSchema, deleteSectorSchema } = require('../utils/validation');

module.exports.addSector = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addSectorItemsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await sectorCtrl.addSector(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateSector = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { sectorId } = params;
    const validationError = updateSectorSchema({ ...body, sectorId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await sectorCtrl.updateSector(body, sectorId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteSector = async (req, res, next) => {
  try {
    const { params } = req;
    const { sectorId } = params;
    const validationError = deleteSectorSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await sectorCtrl.deleteSector(sectorId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllSectors = async (req, res, next) => {
  try {
    let isAdmin = false;
    const { currentUser } = req;
    if (currentUser.role === 'admin') {
      isAdmin = true;
    }
    const data = await sectorCtrl.getAllSectors(isAdmin);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
