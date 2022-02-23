const CommunityHistorySchema = require('./community-history-schema');

module.exports.addCommunityHistory = (communityHistoryData) => {
  const communityHistory = new CommunityHistorySchema(communityHistoryData);
  return new Promise((resolve, reject) => {
    communityHistory.save((err, createdCommunityHistory) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityHistory);
    });
  });
}

module.exports.updateCommunityHistory = (updateCommunityHistoryData, communityHistoryId) => {
  return new Promise((resolve, reject) => {
    CommunityHistorySchema.findOneAndUpdate({ _id: communityHistoryId }, updateCommunityHistoryData, { new: true }, (err, updatedCommunityHistory) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityHistory);
    });
  });
}

module.exports.deleteCommunityHistory = (communityHistoryId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityHistorySchema.findByIdAndUpdate(communityHistoryId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getCommunityHistoryByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityHistorySchema.findOne({ community, active: true }, (err, communityHistory) => {
      if (err) {
        reject(err);
      }
      resolve(communityHistory);
    });
  });
}

module.exports.getAllCommunityHistories = () => {
  return new Promise((resolve, reject) => {
    CommunityHistorySchema.find({ active: true }, (err, allCommunityHistories) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityHistories);
    });
  });
}
