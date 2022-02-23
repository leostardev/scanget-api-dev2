const Boom = require('boom');
const brandDB = require('./brand-model');
const responseMessages = require('../utils/messages');

module.exports.addBrand = async (brand) => {
  try {
    const currentPositionBrand = await brandDB.getBrandByPosition(brand.position);
    if (currentPositionBrand) {
      throw Boom.forbidden(responseMessages.brand.ALREADY_ADDED_BRAND_WITH_CURRENT_POSITION);
    }
    const createdBrand = brandDB.addBrand(brand);
    return createdBrand;
  } catch (error) {
    throw Boom.forbidden(responseMessages.brand.ERROR_ADDING_BRAND, error);
  }
}

module.exports.updateBrand = async (updateData, brandId) => {
  try {
    const updatedBrand = await brandDB.updateBrand(updateData, brandId);
    return updatedBrand;
  } catch (error) {
    throw Boom.forbidden(responseMessages.brand.ERROR_UPDATING_BRAND, error);
  }
}

module.exports.deleteBrand = async (brandId) => {
  try {
    await brandDB.deleteBrand(brandId);
    return {
      message: responseMessages.brand.SUCCESS_DELETE_BRAND
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.brand.ERROR_DELETING_BRAND, error);
  }
}

module.exports.getAllBrands = async () => {
  try {
    const allBrands = await brandDB.getAllBrands();
    return allBrands;
  } catch (error) {
    throw Boom.forbidden(responseMessages.brand.ERROR_GETTING_ALL_BRANDS, error);
  }
}
