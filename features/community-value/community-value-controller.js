const Boom = require('boom');
const communityValueDB = require('./community-value-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityValue = async (communityValue) => {
  try {
    const createdCommunityValue = await communityValueDB.addCommunityValue(communityValue);
    return createdCommunityValue;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_ADDING_COMMUNITY_VALUE, error);
  }
}

module.exports.updateCommunityValue = async (updateData, communityValueId) => {
  try {
    const updatedCommunityValue = await communityValueDB.updateCommunityValue(updateData, communityValueId);
    return updatedCommunityValue;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_UPDATING_COMMUNITY_VALUE, error);
  }
}

module.exports.deleteCommunityValue = async (communityValueId) => {
  try {
    await communityValueDB.deleteCommunityValue(communityValueId);
    return {
      message: responseMessages.communityValue.SUCCESS_DELETE_COMMUNITY_VALUE
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_DELETING_COMMUNITY_VALUE, error);
  }
}

module.exports.getAllCommunityValues = async () => {
  try {
    const allCommunityValues = await communityValueDB.getAllCommunityValues();
    return allCommunityValues;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_GETTING_ALL_COMMUNITY_VALUES, error);
  }
}

module.exports.getCommunityValueByCommunityId = async (communityId) => {
  try {
    const allCommunityValues = await communityValueDB.getCommunityValueByCommunityId(communityId);
    return allCommunityValues;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_GETTING_ALL_COMMUNITY_VALUES, error);
  }
}

module.exports.approveCommunityValue = async (communityValueId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityValueDB.updateCommunityValue(updateData, communityValueId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityValue.ERROR_UPDATING_COMMUNITY_VALUE, error);
  }
}
