const Boom = require('boom');
const shoppinglistCtrl = require('./shoppinglist-controller');
const { addShoppinglistSchema, updateShoppinglistSchema, deleteShoppinglistSchema, getAllShoppinglistSchema } = require('../utils/validation');

module.exports.addShoppinglist = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addShoppinglistSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await shoppinglistCtrl.addShoppinglist(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
module.exports.updateShoppinglist = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { shoppinglistId } = params;
    const validationError = updateShoppinglistSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await shoppinglistCtrl.updateShoppinglist(body, shoppinglistId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteShoppinglist = async (req, res, next) => {
  try {
    const { params } = req;
    const { shoppinglistId } = params;
    const validationError = deleteShoppinglistSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await shoppinglistCtrl.deleteShoppinglist(shoppinglistId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllShoppinglists = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = getAllShoppinglistSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await shoppinglistCtrl.getAllShoppinglists(body.family);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.formatShoppingListProductsModel = async (req, res, next) => {
  try {
    await shoppinglistCtrl.formatShoppingListProductsModel();
    res.json({
      success: true,
      data: {}
    });
  } catch (e) {
    return next(e);
  }
}
