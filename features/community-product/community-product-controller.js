const Boom = require('boom');
const communityProductDB = require('./community-product-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityProduct = async (communityProduct) => {
  try {
    const createdCommunityProduct = await communityProductDB.addCommunityProduct(communityProduct);
    return createdCommunityProduct;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_ADDING_COMMUNITY_PRODUCT, error);
  }
}

module.exports.updateCommunityProduct = async (updateData, communityProductId) => {
  try {
    const updatedCommunityProduct = await communityProductDB.updateCommunityProduct(updateData, communityProductId);
    return updatedCommunityProduct;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_UPDATING_COMMUNITY_PRODUCT, error);
  }
}

module.exports.deleteCommunityProduct = async (communityProductId) => {
  try {
    await communityProductDB.deleteCommunityProduct(communityProductId);
    return {
      message: responseMessages.communityProduct.SUCCESS_DELETE_COMMUNITY_PRODUCT
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_DELETING_COMMUNITY_PRODUCT, error);
  }
}

module.exports.getCommunityProductById = async (communityProductId) => {
  try {
    const communityProduct = await communityProductDB.getCommunityProductById(communityProductId);
    return communityProduct;
  } catch (error) {
    throw Boom.forbidden('', error);
  }
}

module.exports.getAllCommunityProducts = async () => {
  try {
    const allCommunityProducts = await communityProductDB.getAllCommunityProducts();
    return allCommunityProducts;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_GETTING_ALL_COMMUNITY_PRODUCTS, error);
  }
}

module.exports.getCommunityProductsByCommunityId = async (communityId, currentUser) => {
  try {
    let allCommunityProducts;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin') {
      allCommunityProducts = await communityProductDB.getCommunityProductsByCommunityIdForAdmin(communityId);
    } else {
      allCommunityProducts = await communityProductDB.getCommunityProductsByCommunityId(communityId);
    }
    return allCommunityProducts;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_GETTING_ALL_COMMUNITY_PRODUCTS, error);
  }
}

module.exports.approveCommunityProduct = async (communityProductId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityProductDB.updateCommunityProduct(updateData, communityProductId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_UPDATING_COMMUNITY_PRODUCT, error);
  }
}

module.exports.deactivateCommunityProducts = async (communityProductId) => {
  try {
    const updateData = {
      deactivated: true
    };
    const updatedCommunity = await communityProductDB.updateCommunityProduct(updateData, communityProductId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_UPDATING_COMMUNITY_PRODUCT, error);
  }
}

module.exports.activateCommunityProducts = async (communityProductId) => {
  try {
    const updateData = {
      deactivated: false
    };
    const updatedCommunity = await communityProductDB.updateCommunityProduct(updateData, communityProductId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityProduct.ERROR_UPDATING_COMMUNITY_PRODUCT, error);
  }
}
