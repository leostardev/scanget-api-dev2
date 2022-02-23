const Boom = require('boom');
const communityHistoryDB = require('./community-history-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityHistory = async (communityHistory) => {
  try {
    const createdCommunityHistory = await communityHistoryDB.addCommunityHistory(communityHistory);
    return createdCommunityHistory;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_ADDING_COMMUNITY_HISTORY, error);
  }
}

module.exports.updateCommunityHistory = async (updateData, communityHistoryId) => {
  try {
    const updatedCommunityHistory = await communityHistoryDB.updateCommunityHistory(updateData, communityHistoryId);
    return updatedCommunityHistory;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_UPDATING_COMMUNITY_HISTORY, error);
  }
}

module.exports.deleteCommunityHistory = async (communityHistoryId) => {
  try {
    await communityHistoryDB.deleteCommunityHistory(communityHistoryId);
    return {
      message: responseMessages.communityHistory.SUCCESS_DELETE_COMMUNITY_HISTORY
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_DELETING_COMMUNITY_HISTORY, error);
  }
}

module.exports.getCommunityHistoryByCommunityId = async (communityId) => {
  try {
    const communityHistory = await communityHistoryDB.getCommunityHistoryByCommunityId(communityId);
    return communityHistory;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_GETTING_ALL_COMMUNITY_HISTORIES, error);
  }
}

module.exports.getAllCommunityHistories = async () => {
  try {
    const allCommunityHistories = await communityHistoryDB.getAllCommunityHistories();
    return allCommunityHistories;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_GETTING_ALL_COMMUNITY_HISTORIES, error);
  }
}

module.exports.approveCommunityHistory = async (communityHistoryId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityHistoryDB.updateCommunityHistory(updateData, communityHistoryId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityHistory.ERROR_UPDATING_COMMUNITY_HISTORY, error);
  }
}
