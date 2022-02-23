const Boom = require('boom');
const mongoose = require('mongoose');
const promotionCtrl = require('./promotion-controller');
const { addPromotionSchema, editPromotionSchema, deletePromotionSchema, approvePromotionSchema, getAllPromotionsSchema, rejectPromotionSchema } = require('../utils/validation');

module.exports.addPromotion = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = addPromotionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const promotionData = { ...body };
    if (currentUser.role === 'admin') {
      promotionData.approved = true;
    }
    const data = await promotionCtrl.addPromotion(promotionData);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
module.exports.updatePromotion = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { promotionId } = params;
    const validationError = editPromotionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await promotionCtrl.updatePromotion(body, promotionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deletePromotion = async (req, res, next) => {
  try {
    const { params } = req;
    const { promotionId } = params;
    const validationError = deletePromotionSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await promotionCtrl.deletePromotion(promotionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllPromotions = async (req, res, next) => {
  let data;
  try {
    const { currentUser, queryParams } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      const validationError = getAllPromotionsSchema(queryParams);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }

    if (currentUser.role === 'admin') {
      data = await promotionCtrl.getAllPromotionsForAdmin(queryParams);
    } else if (currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      data = await promotionCtrl.getAllPromotionsForClient(queryParams);
    } else {
      data = await promotionCtrl.getAllPromotions();
    }
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.approvePromotion = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = approvePromotionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await promotionCtrl.approvePromotion(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.rejectPromotion = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = rejectPromotionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await promotionCtrl.rejectPromotion(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getPromotionId = (req, res, next) => {
  try {
    const _id = mongoose.Types.ObjectId();
    res.json({
      success: true,
      data: { _id }
    });
  } catch (e) {
    return next(e);
  }
}
