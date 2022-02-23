const Boom = require('boom');
const communityPeopleDB = require('./community-people-model');
const responseMessages = require('../utils/messages');

module.exports.addCommunityPeople = async (communityPeople) => {
  try {
    const createdCommunityPeople = await communityPeopleDB.addCommunityPeople(communityPeople);
    return createdCommunityPeople;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_ADDING_COMMUNITY_PEOPLE, error);
  }
}

module.exports.updateCommunityPeople = async (updateData, communityPeopleId) => {
  try {
    const updatedCommunityPeople = await communityPeopleDB.updateCommunityPeople(updateData, communityPeopleId);
    return updatedCommunityPeople;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_UPDATING_COMMUNITY_PEOPLE, error);
  }
}

module.exports.deleteCommunityPeople = async (communityPeopleId) => {
  try {
    await communityPeopleDB.deleteCommunityPeople(communityPeopleId);
    return {
      message: responseMessages.communityPeople.SUCCESS_DELETE_COMMUNITY_PEOPLE
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_DELETING_COMMUNITY_PEOPLE, error);
  }
}

module.exports.getCommunityPeopleByCommunityId = async (communityId, isAdmin) => {
  try {
    const allCommunityPeoples = await communityPeopleDB.getCommunityPeopleByCommunityId(communityId);
    allCommunityPeoples.people.sort((a, b) => ((a.weight > b.weight) ? -1 : 1));
    if (isAdmin) {
      return allCommunityPeoples;
    }
    allCommunityPeoples.people = allCommunityPeoples.people.filter(people => !people.deactivated);
    return allCommunityPeoples;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_GETTING_ALL_COMMUNITY_PEOPLE, error);
  }
}

module.exports.getAllCommunityPeople = async () => {
  try {
    const allCommunityPeoples = await communityPeopleDB.getAllCommunityPeople();
    return allCommunityPeoples;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_GETTING_ALL_COMMUNITY_PEOPLE, error);
  }
}

module.exports.approveCommunityPeople = async (communityPeopleId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityPeopleDB.updateCommunityPeople(updateData, communityPeopleId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityPeople.ERROR_UPDATING_COMMUNITY_PEOPLE, error);
  }
}
