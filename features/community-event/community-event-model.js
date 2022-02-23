const CommunityEventSchema = require('./community-event-schema');

module.exports.addCommunityEvent = (communityEventData) => {
  const communityEvent = new CommunityEventSchema(communityEventData);
  return new Promise((resolve, reject) => {
    communityEvent.save((err, createdCommunityEvent) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityEvent);
    });
  });
}

module.exports.updateCommunityEvent = (updateCommunityEventData, communityEventId) => {
  return new Promise((resolve, reject) => {
    CommunityEventSchema.findOneAndUpdate({ _id: communityEventId }, updateCommunityEventData, { new: true }, (err, updatedCommunityEvent) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityEvent);
    });
  });
}

module.exports.deleteCommunityEvent = (communityEventId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityEventSchema.findByIdAndUpdate(communityEventId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getCommunityEventById = (communityEventId, populate) => {
  let populateString = '';
  if (populate) {
    populateString = 'interestedUsers'
  }
  return new Promise((resolve, reject) => {
    CommunityEventSchema.findById(communityEventId).populate(`${populateString}`).exec((err2, data) => {
      if (err2) {
        reject(err2);
      }
      resolve(data);
    });
  });
}

module.exports.getCommunityEventsByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityEventSchema.find({
      community,
      active: true,
      approved: true,
      deactivated: false
    }).sort({ weight: -1 }).exec((err, allCommunityEvents) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityEvents);
    });
  });
}

module.exports.getCommunityEventsByCommunityIdForAdmin = (community) => {
  return new Promise((resolve, reject) => {
    CommunityEventSchema.find({ community, active: true }).populate('interestedUsers').sort({ weight: -1 }).lean().exec((err, allCommunityEvents) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityEvents);
    });
  });
}

module.exports.getAllCommunityEvents = () => {
  return new Promise((resolve, reject) => {
    CommunityEventSchema.find({ active: true }, (err, allCommunityEvents) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityEvents);
    });
  });
}
