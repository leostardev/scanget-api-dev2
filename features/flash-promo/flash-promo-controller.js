const Boom = require('boom');
const moment = require('moment');
const flashPromoDB = require('./flash-promo-model');
const responseMessages = require('../utils/messages');

module.exports.addFlashPromo = async (flashPromo) => {
  try {
    const flashPromoData = {
      ...flashPromo,
      startDate: moment(flashPromo.startDate).utc().startOf('day'),
      endDate: moment(flashPromo.endDate).utc().endOf('day')
    }
    const createdFlashPromo = await flashPromoDB.addFlashPromo(flashPromoData);
    return createdFlashPromo;
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_ADDING_FLASH_PROMO, error);
  }
}

module.exports.updateFlashPromo = async (updateData, flashPromoId) => {
  const flashPromoData = {
    ...updateData
  }
  if (updateData.startDate && updateData.endDate) {
    flashPromoData.startDate = moment(updateData.startDate).utc().startOf('day'),
    flashPromoData.endDate= moment(updateData.endDate).utc().endOf('day')
  }
  try {
    const updatedFlashPromo = await flashPromoDB.updateFlashPromo(flashPromoData, flashPromoId);
    return updatedFlashPromo;
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_UPDATING_FLASH_PROMO, error);
  }
}

module.exports.deleteFlashPromo = async (flashPromoId) => {
  try {
    await flashPromoDB.deleteFlashPromo(flashPromoId);
    return {
      message: responseMessages.flashPromo.SUCCESS_DELETE_FLASH_PROMO
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_DELETING_FLASH_PROMO, error);
  }
}

module.exports.getAllFlashPromos = async () => {
  try {
    const allFlashPromos = await flashPromoDB.getAllFlashPromos();
    return allFlashPromos;
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_GETTING_ALL_FLASH_PROMO, error);
  }
}

module.exports.getFlashPromoById = async (flashPromoId) => {
  try {
    const allFlashPromos = await flashPromoDB.getFlashPromoById(flashPromoId);
    return allFlashPromos;
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_GETTING_ALL_FLASH_PROMO, error);
  }
}

module.exports.getTodayFlashPromo = async () => {
  try {
    const todayDate = moment().utc().toDate();
    const query = {
      startDate: {
        $lte: todayDate
      },
      endDate: {
        $gte: todayDate
      },
      active: true,
      deactivated: false
    }
    const allFlashPromos = await flashPromoDB.getTodayFlashPromo(query);
    return allFlashPromos;
  } catch (error) {
    throw Boom.forbidden(responseMessages.flashPromo.ERROR_GETTING_ALL_FLASH_PROMO, error);
  }
}
