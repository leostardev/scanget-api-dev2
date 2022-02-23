const Boom = require('boom');
const flashPromoCtrl = require('./flash-promo-controller');
const { addFlashPromoSchema, updateFlashPromoSchema, deleteFlashPromoSchema } = require('../utils/validation');

module.exports.addFlashPromo = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addFlashPromoSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await flashPromoCtrl.addFlashPromo(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateFlashPromo = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { flashPromoId } = params;
    const validationError = updateFlashPromoSchema({ ...body, flashPromoId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await flashPromoCtrl.updateFlashPromo(body, flashPromoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activateFlashPromo = async (req, res, next) => {
  try {
    const { params } = req;
    const { flashPromoId } = params;
    const data = await flashPromoCtrl.updateFlashPromo({ deactivated: false }, flashPromoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateFlashPromo = async (req, res, next) => {
  try {
    const { params } = req;
    const { flashPromoId } = params;
    const data = await flashPromoCtrl.updateFlashPromo({ deactivated: true }, flashPromoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteFlashPromo = async (req, res, next) => {
  try {
    const { params } = req;
    const { flashPromoId } = params;
    const validationError = deleteFlashPromoSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await flashPromoCtrl.deleteFlashPromo(flashPromoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllFlashPromos = async (req, res, next) => {
  try {
    const data = await flashPromoCtrl.getAllFlashPromos();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getFlashPromoById = async (req, res, next) => {
  try {
    const { params } = req;
    const { flashPromoId } = params;
    const data = await flashPromoCtrl.getFlashPromoById(flashPromoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getTodayFlashPromo = async (req, res, next) => {
  try {
    const data = await flashPromoCtrl.getTodayFlashPromo();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
