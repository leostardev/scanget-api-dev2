const Boom = require('boom');
const brandCtrl = require('./brand-controller');
const { addBrandItemsSchema, updateBrandSchema, deleteBrandSchema } = require('../utils/validation');

module.exports.addBrand = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addBrandItemsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await brandCtrl.addBrand(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateBrand = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { brandId } = params;
    const validationError = updateBrandSchema({ ...body, brandId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await brandCtrl.updateBrand(body, brandId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteBrand = async (req, res, next) => {
  try {
    const { params } = req;
    const { brandId } = params;
    const validationError = deleteBrandSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await brandCtrl.deleteBrand(brandId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllBrands = async (req, res, next) => {
  try {
    const data = await brandCtrl.getAllBrands();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
