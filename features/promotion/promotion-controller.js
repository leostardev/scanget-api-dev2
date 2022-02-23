const Boom = require('boom');
const moment = require('moment');
const promotionDB = require('./promotion-model');
const responseMessages = require('../utils/messages');
const dealDB = require('../deal/deal-model');
const clientPackageDB = require('../client-package/client-package-model');
const periodDB = require('../period/period-model');

module.exports.addPromotion = async (promotion) => {
  try {
    const deal = await dealDB.getDealById(promotion.deal);
    if (!deal) {
      throw Boom.forbidden(responseMessages.promotion.INVALID_DEAL_REFERENECE);
    }
    const validPeriod = getPeriodValidity(deal.periods, promotion.periods);
    if (!validPeriod) {
      throw Boom.forbidden(responseMessages.promotion.ERR_INVALID_DATE_INTERVAL);
    }
    let createdPromotion = await promotionDB.addPromotion(promotion);
    if (promotion.approved) {
      await clientPackageDB.decreaseBanners(createdPromotion.clientPackage._id, createdPromotion.periods.length);
    }
    let promotionArrayForStatus = [createdPromotion];
    promotionArrayForStatus = await attachStatusToPromotions(promotionArrayForStatus);
    createdPromotion = promotionArrayForStatus[0];
    return createdPromotion;
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_ADDING_PROMOTION, error);
  }
}

module.exports.updatePromotion = async (updateData, promotionId) => {
  try {
    let updatedPromotion = await promotionDB.updatePromotion(updateData, promotionId);
    let promotionArrayForStatus = [updatedPromotion];
    promotionArrayForStatus = await attachStatusToPromotions(promotionArrayForStatus);
    updatedPromotion = promotionArrayForStatus[0];
    return updatedPromotion;
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_UPDATING_PROMOTION, error);
  }
}

module.exports.deletePromotion = async (promotionId) => {
  try {
    await promotionDB.deletePromotion(promotionId);
    return {
      message: responseMessages.promotion.SUCCESS_DELETE_PROMOTION
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_DELETING_PROMOTION, error);
  }
}

module.exports.getAllPromotions = async () => {
  try {
    const allPromotions = await promotionDB.getAllPromotions();
    return allPromotions;
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_GETTING_ALL_PROMOTION, error);
  }
}

module.exports.getAllPromotionsForAdmin = async (queryParams) => {
  try {
    let allPromotions = await promotionDB.getAllPromotionsForAdmin(queryParams);
    allPromotions = await attachStatusToPromotions(allPromotions);
    return allPromotions;
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_GETTING_ALL_PROMOTION, error);
  }
}

module.exports.getAllPromotionsForClient = async (queryParams) => {
  try {
    const query = {
      client: queryParams.client
    };
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      queryParams.minDate = moment(new Date(queryParams.minDate)).startOf('day');
      queryParams.maxDate = moment(new Date(queryParams.maxDate)).endOf('day');
    }
    let allPromotions = await promotionDB.getAllPromotionsForClient(query);
    allPromotions = await attachStatusToPromotions(allPromotions);
    return allPromotions;
  } catch (error) {
    throw Boom.forbidden(responseMessages.promotion.ERROR_GETTING_ALL_PROMOTION, error);
  }
}

const attachStatusToPromotions = async (allPromotions) => {
  const currentPeriod = await periodDB.getCurrentPeriod();
  const updatedPromotions = allPromotions.map((promotion) => { // eslint-disable-line
    if (promotion.rejected) {
      promotion.status = 'Rejected';
    } else if (!promotion.approved) {
      promotion.status = 'Pending';
    } else if (checkIfCurrentPeriodExistsInPromotionPeriods(promotion, currentPeriod)) {
      promotion.status = 'Active';
    } else {
      promotion.status = 'Inactive';
    }
    return promotion;
  });
  return updatedPromotions;
}

module.exports.attachStatusToPromotions = attachStatusToPromotions;

const checkIfCurrentPeriodExistsInPromotionPeriods = (promotion, currentPeriod) => {
  for (let i = 0; i < promotion.periods.length; i++) {
    if (currentPeriod && promotion.periods[i].description === currentPeriod.description) {
      return true;
    }
  }
  return false;
}

module.exports.approvePromotion = async (body) => {
  try {
    const { promotionId, clientPackageId } = body;
    const updateData = {
      clientPackage: clientPackageId,
      approved: true
    };
    const promotion = await promotionDB.getPromotionById(promotionId);
    const updatedPromotion = await promotionDB.updatePromotion(updateData, promotionId);
    // decrease banners = require(clientPackage
    await clientPackageDB.decreaseBanners(clientPackageId, promotion.periods.length);
    return updatedPromotion;
  } catch (error) {
    throw Boom.forbidden('Error approving promotion', error);
  }
}

module.exports.rejectPromotion = async (body) => {
  try {
    const { promotionId, reason } = body;
    const updateData = {
      reason
    };
    const updatedPromotion = await promotionDB.updatePromotion(updateData, promotionId);
    return updatedPromotion;
  } catch (error) {
    throw Boom.forbidden('Error approving promotion', error);
  }
}

const getPeriodValidity = (dealPeriods, promotionPeriods) => {
  for (let i = 0; i < promotionPeriods.length; i++) {
    let check = false;
    for (let j = 0; j < dealPeriods.length; j++) {
      if (promotionPeriods[i].toString() === dealPeriods[j]._id.toString()) {
        check = true;
      }
    }
    if (!check) {
      return false;
    }
  }
  return true;
}
