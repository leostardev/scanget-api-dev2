const Boom = require('boom');
const communityEventDB = require('./community-event-model');
const responseMessages = require('../utils/messages');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');

module.exports.addCommunityEvent = async (communityEvent) => {
  try {
    const createdCommunityEvent = await communityEventDB.addCommunityEvent(communityEvent);
    return createdCommunityEvent;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_ADDING_COMMUNITY_EVENT, error);
  }
}

module.exports.updateCommunityEvent = async (updateData, communityEventId) => {
  try {
    const updatedCommunityEvent = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunityEvent;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.addUserInterestInCommunityEvent = async (userId, communityEventId) => {
  try {
    const updateData = {
      $addToSet: {
        interestedUsers: userId
      }
    };
    const updatedCommunityEvent = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunityEvent;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.removeUserInterestInCommunityEvent = async (userId, communityEventId) => {
  try {
    const updateData = {
      $pull: {
        interestedUsers: userId
      }
    };
    const updatedCommunityEvent = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunityEvent;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.deleteCommunityEvent = async (communityEventId) => {
  try {
    await communityEventDB.deleteCommunityEvent(communityEventId);
    return {
      message: responseMessages.communityEvent.SUCCESS_DELETE_COMMUNITY_EVENT
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_DELETING_COMMUNITY_EVENT, error);
  }
}

module.exports.getCommunityEventById = async (communityEventId) => {
  try {
    const communityEvent = await communityEventDB.getCommunityEventById(communityEventId);
    return communityEvent;
  } catch (error) {
    throw Boom.forbidden('', error);
  }
}

module.exports.getCommunityEventsByCommunityId = async (communityId, currentUser) => {
  try {
    let allCommunityEvents;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin') {
      allCommunityEvents = await communityEventDB.getCommunityEventsByCommunityIdForAdmin(communityId);
      for (let i = 0; i < allCommunityEvents.length; i++) {
        if (allCommunityEvents[i].interestedUsers) {
          allCommunityEvents[i].interestedUsers = allCommunityEvents[i].interestedUsers.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone
          }));
        } else {
          allCommunityEvents[i].interestedUsers = [];
        }
      }
    } else {
      allCommunityEvents = await communityEventDB.getCommunityEventsByCommunityId(communityId);
    }
    return allCommunityEvents;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_GETTING_ALL_COMMUNITY_EVENTS, error);
  }
}

module.exports.getAllCommunityEvents = async () => {
  try {
    const allCommunityEvents = await communityEventDB.getAllCommunityEvents();
    return allCommunityEvents;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_GETTING_ALL_COMMUNITY_EVENTS, error);
  }
}

module.exports.approveCommunityEvent = async (communityEventId) => {
  try {
    const updateData = {
      approved: true
    };
    const updatedCommunity = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.activateCommunityEvents = async (communityEventId) => {
  try {
    const updateData = {
      deactivated: false
    };
    const updatedCommunity = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.deactivateCommunityEvents = async (communityEventId) => {
  try {
    const updateData = {
      deactivated: true
    };
    const updatedCommunity = await communityEventDB.updateCommunityEvent(updateData, communityEventId);
    return updatedCommunity;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}

module.exports.getCommunityEventIntertedPeopleCSV = async (communityEventId) => {
  try {
    const communityEvent = await communityEventDB.getCommunityEventById(communityEventId, true);
    let interestedUsers = communityEvent.interestedUsers.map(user => {
      return {
        userId: user._id.toString(),
        name: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        family: user.family.toString()
      }
    });
    const s3UploadData = await createAndUploadCsvToS3(interestedUsers, `community-event-user-csv/${communityEventId.toString()}/${Date.now()}/interested-users.csv`);
    console.log(s3UploadData);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.communityEvent.ERROR_UPDATING_COMMUNITY_EVENT, error);
  }
}
