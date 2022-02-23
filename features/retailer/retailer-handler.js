const Boom = require('boom');
const retailerCtrl = require('./retailer-controller');
const { addRetailerSchema, shopSchema, updateRetailerSchema, deleteRetailerSchema, workingDaysSchema, deleteRetailerShopSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.addRetailer = async (req, res, next) => {
  try {
    const { body } = req;
    let validationError = addRetailerSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.shops && body.shops.length > 0) {
      for (let i = 0; i < body.shops.length; i++) {
        const shop = body.shops[i];
        validationError = shopSchema(shop);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
        validationError = workingDaysSchema(shop.working_days);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
      }
    }
    const data = await retailerCtrl.addRetailer(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateRetailer = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { retailerId } = params;
    let validationError = updateRetailerSchema({ ...body, retailerId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.shops && body.shops.length > 0) {
      for (let i = 0; i < body.shops.length; i++) {
        const shop = body.shops[i];
        validationError = shopSchema(shop);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
        validationError = workingDaysSchema(shop.working_days);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
      }
    } else {
      throw Boom.forbidden(responseMessages.retailer.SHOP_EMPTY);
    }
    const data = await retailerCtrl.updateRetailer(body, retailerId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteRetailer = async (req, res, next) => {
  try {
    const { params } = req;
    const { retailerId } = params;
    const validationError = deleteRetailerSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await retailerCtrl.deleteRetailer(retailerId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllRetailers = async (req, res, next) => {
  try {
    const data = await retailerCtrl.getAllRetailers();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteRetailerShop = async (req, res, next) => {
  try {
    const { body, params } = req;
    const validationError = deleteRetailerShopSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await retailerCtrl.deleteRetailerShop(body.shop, params.retailerId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
