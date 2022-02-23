const Boom = require('boom');
const communityRecipeDB = require('./community-recipe-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityRecipe = async (communityRecipe) => {
  try {
    const createdCommunityRecipe = await communityRecipeDB.addCommunityRecipe(communityRecipe);
    return createdCommunityRecipe;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_ADDING_COMMUNITY_RECIPE, error);
  }
}

module.exports.updateCommunityRecipe = async (updateData, communityRecipeId) => {
  try {
    const updatedCommunityRecipe = await communityRecipeDB.updateCommunityRecipe(updateData, communityRecipeId);
    return updatedCommunityRecipe;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_UPDATING_COMMUNITY_RECIPE, error);
  }
}

module.exports.deleteCommunityRecipe = async (communityRecipeId) => {
  try {
    await communityRecipeDB.deleteCommunityRecipe(communityRecipeId);
    return {
      message: responseMessages.communityRecipe.SUCCESS_DELETE_COMMUNITY_RECIPE
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_DELETING_COMMUNITY_RECIPE, error);
  }
}

module.exports.getCommunityRecipeById = async (communityRecipeId) => {
  try {
    const communityRecipe = await communityRecipeDB.getCommunityRecipeById(communityRecipeId);
    return communityRecipe;
  } catch (error) {
    throw Boom.forbidden('', error);
  }
}

module.exports.getAllCommunityRecipes = async () => {
  try {
    const allCommunityRecipes = await communityRecipeDB.getAllCommunityRecipes();
    return allCommunityRecipes;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_GETTING_ALL_COMMUNITY_RECIPES, error);
  }
}

module.exports.getCommunityRecipesByCommunityId = async (communityId, currentUser) => {
  try {
    let allCommunityRecipes;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin') {
      allCommunityRecipes = await communityRecipeDB.getCommunityRecipesByCommunityIdForAdmin(communityId);
    } else {
      allCommunityRecipes = await communityRecipeDB.getCommunityRecipesByCommunityId(communityId);
    }
    return allCommunityRecipes;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_GETTING_ALL_COMMUNITY_RECIPES, error);
  }
}

module.exports.approveCommunityRecipe = async (communityRecipeId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityRecipeDB.updateCommunityRecipe(updateData, communityRecipeId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_UPDATING_COMMUNITY_RECIPE, error);
  }
}

module.exports.deactivateCommunityRecipes = async (communityRecipeId) => {
  try {
    const updateData = {
      deactivated: true
    };
    const updatedCommunity = await communityRecipeDB.updateCommunityRecipe(updateData, communityRecipeId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_UPDATING_COMMUNITY_RECIPE, error);
  }
}

module.exports.activateCommunityRecipes = async (communityRecipeId) => {
  try {
    const updateData = {
      deactivated: false
    };
    const updatedCommunity = await communityRecipeDB.updateCommunityRecipe(updateData, communityRecipeId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityRecipe.ERROR_UPDATING_COMMUNITY_RECIPE, error);
  }
}
