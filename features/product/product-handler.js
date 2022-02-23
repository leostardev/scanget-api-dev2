const Boom = require('boom');
const productCtrl = require('./product-controller');
const { addProductSchema, updateProductSchema, deleteProductSchema, getAllProductsSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');
const config = require('../../config');

module.exports.addProduct = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addProductSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await productCtrl.addProduct(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateProduct = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { productId } = params;
    const validationError = updateProductSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await productCtrl.updateProduct(body, productId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteProduct = async (req, res, next) => {
  try {
    const { params } = req;
    const { productId } = params;
    const validationError = deleteProductSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await productCtrl.deleteProduct(productId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllProducts = async (req, res, next) => {
  try {
    const { currentUser, queryParams } = req;
    const validationError = getAllProductsSchema(queryParams);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    if (currentUser.role !== 'admin' && queryParams.client === 'all') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const data = await productCtrl.getAllProducts(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.getProductById = async (req, res, next) => {
  try {
    const { params } = req;
    const { productId } = params;
    const validationError = deleteProductSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await productCtrl.getProductById(productId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.getProductsByCategory = async (req, res, next) => {
  const { params, currentUser, queryParams } = req;
  if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
    throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
  }
  try {
    const data = await productCtrl.getProductsByCategory(params, queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.exportProductsToCsv = async (req, res, next) => {
  try {
    const { currentUser, queryParams } = req;
    const validationError = getAllProductsSchema(queryParams);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (currentUser.role !== 'admin' && currentUser.role !== 'client-admin' && currentUser.role !== 'client-user') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    if (currentUser.role !== 'admin' && queryParams.client === 'all') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const data = await productCtrl.exportProductsToCsv(queryParams);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${data.Key}` }
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}
