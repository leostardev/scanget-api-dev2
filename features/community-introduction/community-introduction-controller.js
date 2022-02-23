const Boom = require('boom');
const communityIntroductionDB = require('./community-introduction-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityIntroduction = async (communityIntroduction) => {
  try {
    const createdCommunityIntroduction = await communityIntroductionDB.addCommunityIntroduction(communityIntroduction);
    return createdCommunityIntroduction;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_ADDING_COMMUNITY_HISTORY, error);
  }
}

module.exports.updateCommunityIntroduction = async (updateData, communityIntroductionId) => {
  try {
    const updatedCommunityIntroduction = await communityIntroductionDB.updateCommunityIntroduction(updateData, communityIntroductionId);
    return updatedCommunityIntroduction;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_UPDATING_COMMUNITY_HISTORY, error);
  }
}

module.exports.deleteCommunityIntroduction = async (communityIntroductionId) => {
  try {
    await communityIntroductionDB.deleteCommunityIntroduction(communityIntroductionId);
    return {
      message: responseMessages.communityIntroduction.SUCCESS_DELETE_COMMUNITY_HISTORY
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_DELETING_COMMUNITY_HISTORY, error);
  }
}

module.exports.getCommunityIntroductionByCommunityId = async (communityId) => {
  try {
    const communityIntroduction = await communityIntroductionDB.getCommunityIntroductionByCommunityId(communityId);
    return communityIntroduction;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_GETTING_ALL_COMMUNITY_HISTORIES, error);
  }
}

module.exports.getAllCommunityIntroduction = async () => {
  try {
    const allCommunityIntroduction = await communityIntroductionDB.getAllCommunityIntroduction();
    return allCommunityIntroduction;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_GETTING_ALL_COMMUNITY_HISTORIES, error);
  }
}

module.exports.approveCommunityIntroduction = async (communityIntroductionId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityIntroductionDB.updateCommunityIntroduction(updateData, communityIntroductionId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityIntroduction.ERROR_UPDATING_COMMUNITY_HISTORY, error);
  }
}
