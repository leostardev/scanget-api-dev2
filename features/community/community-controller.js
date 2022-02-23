const Boom = require('boom');
const communityDB = require('./community-model');
const responseMessages = require('../utils/messages');
const communityHistoryDB = require('../community-history/community-history-model');
const communityValuesDB = require('../community-value/community-value-model');
const communityPeopleDB = require('../community-people/community-people-model');
const communityIntroductionDB = require('../community-introduction/community-introduction-model');

module.exports.createCommunity = async (community) => {
  try {
    const createdCommunity = await communityDB.createCommunity(community);
    if (community.permissions.includes('Introduction')) {
      const communityIntroductionData = {
        community: createdCommunity._id,
        description: '',
        client: community.client
      };
      await communityIntroductionDB.addCommunityIntroduction(communityIntroductionData);
    }
    if (community.permissions.includes('Our history')) {
      const communityHistoryData = {
        community: createdCommunity._id,
        description: '',
        client: community.client
      };
      await communityHistoryDB.addCommunityHistory(communityHistoryData);
    }
    if (community.permissions.includes('Our values')) {
      const communityValuesData = {
        community: createdCommunity._id,
        description: '',
        title: '',
        client: community.client,
        approved: true
      };
      await communityValuesDB.addCommunityValue(communityValuesData);
    }
    if (community.permissions.includes('Our people')) {
      const communityPeopleData = {
        community: createdCommunity._id,
        description: '',
        people: [],
        client: community.client,
        approved: true
      };
      await communityPeopleDB.addCommunityPeople(communityPeopleData);
    }
    return createdCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_ADDING_COMMUNITY, error);
  }
}

module.exports.updateCommunity = async (updateData, communityId) => {
  try {
    const updatedCommunity = await communityDB.updateCommunity(updateData, communityId);
    if (updateData.permissions && updateData.permissions.includes('Introduction')) {
      const currentCommunityIntroduction = await communityIntroductionDB.getCommunityIntroductionByCommunityId(updatedCommunity._id);
      if (!currentCommunityIntroduction) {
        const communityIntroductionData = {
          community: updatedCommunity._id,
          description: '',
          client: updatedCommunity.client,
          approved: true
        };
        await communityIntroductionDB.addCommunityIntroduction(communityIntroductionData);
      }
    }
    if (updateData.permissions && updateData.permissions.includes('Our history')) {
      const currentCommunityHistory = await communityHistoryDB.getCommunityHistoryByCommunityId(updatedCommunity._id);
      if (!currentCommunityHistory) {
        const communityHistoryData = {
          community: updatedCommunity._id,
          description: '',
          client: updatedCommunity.client,
          approved: true
        };
        await communityHistoryDB.addCommunityHistory(communityHistoryData);
      }
    }
    if (updateData.permissions && updateData.permissions.includes('Our values')) {
      const currentCommunityValues = await communityValuesDB.getCommunityValueByCommunityId(updatedCommunity._id);
      if (!currentCommunityValues) {
        const communityValuesData = {
          community: updatedCommunity._id,
          description: '',
          title: '',
          client: updatedCommunity.client
        };
        await communityValuesDB.addCommunityValue(communityValuesData);
      }
    }
    if (updateData.permissions && updateData.permissions.includes('Our people')) {
      const currentCommunityPeople = await communityPeopleDB.getCommunityPeopleByCommunityId(updatedCommunity._id);
      if (!currentCommunityPeople) {
        const communityPeopleData = {
          community: updatedCommunity._id,
          description: '',
          people: [],
          client: updatedCommunity.client
        };
        await communityPeopleDB.addCommunityPeople(communityPeopleData);
      }
    }
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_UPDATING_COMMUNITY, error);
  }
}

module.exports.deleteCommunity = async (communityId) => {
  try {
    await communityDB.deleteCommunity(communityId);
    return {
      message: responseMessages.community.SUCCESS_DELETE_COMMUNITY
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_DELETING_COMMUNITY, error);
  }
}

module.exports.getAllCommunities = async () => {
  try {
    const allCommunities = await communityDB.getAllCommunities();
    return allCommunities;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_GETTING_ALL_COMMUNITIES, error);
  }
}

module.exports.getAllCommunitiesByClientId = async (client) => {
  try {
    const allCommunities = await communityDB.getAllCommunitiesByClientId(client);
    return allCommunities;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_GETTING_ALL_COMMUNITIES, error);
  }
}

module.exports.getCommunityById = async (communityId) => {
  try {
    const allCommunities = await communityDB.getCommunityById(communityId);
    return allCommunities;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_GETTING_ALL_COMMUNITIES, error);
  }
}

module.exports.getAllCommunitiesForAdmin = async () => {
  try {
    const allCommunities = await communityDB.getAllCommunitiesForAdmin();
    return allCommunities;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_GETTING_ALL_COMMUNITIES, error);
  }
}
module.exports.approveCommunity = async (communityId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityDB.updateCommunity(updateData, communityId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_UPDATING_COMMUNITY, error);
  }
}

module.exports.activateCommunity = async (communityId) => {
  try {
    const updateData = {
      deactivated: false
    };
    const updatedCommunity = await communityDB.updateCommunity(updateData, communityId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_UPDATING_COMMUNITY, error);
  }
}

module.exports.deactivateCommunity = async (communityId) => {
  try {
    const updateData = {
      deactivated: true
    };
    const updatedCommunity = await communityDB.updateCommunity(updateData, communityId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_UPDATING_COMMUNITY, error);
  }
}

module.exports.getCommunityByShortId = async (communitySid) => {
  try {
    const community = await communityDB.getCommunityByShortId(communitySid);
    return community;
  } catch (error) {
    throw Boom.forbidden(responseMessages.community.ERROR_UPDATING_COMMUNITY, error);
  }
}
