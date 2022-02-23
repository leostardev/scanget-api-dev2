const CommunitySchema = require('./community-schema');

module.exports.createCommunity = (communityData) => {
  const community = new CommunitySchema(communityData);
  return new Promise((resolve, reject) => {
    community.save((err, createdCommunity) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunity);
    });
  });
}

module.exports.updateCommunity = (updateCommunityData, communityId) => {
  return new Promise((resolve, reject) => {
    CommunitySchema.findOneAndUpdate({ _id: communityId }, updateCommunityData, { new: true }, (err, updatedCommunity) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunity);
    });
  });
}

module.exports.deleteCommunity = (communityId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunitySchema.findByIdAndUpdate(communityId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllCommunities = () => {
  return new Promise((resolve, reject) => {
    CommunitySchema.find({ active: true, approved: true, deactivated: false }).sort({ weight: -1, name: 1 }).exec((err, allCommunities) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunities);
    });
  });
}

module.exports.getAllCommunitiesByClientId = (client) => {
  return new Promise((resolve, reject) => {
    CommunitySchema.find({ active: true, client }).exec((err, allCommunities) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunities);
    });
  });
}

module.exports.getCommunityById = (communityId) => {
  return new Promise((resolve, reject) => {
    CommunitySchema.findById(communityId).exec((err, community) => {
      if (err) {
        reject(err);
      }
      resolve(community);
    });
  });
}

module.exports.getAllCommunitiesForAdmin = () => {
  return new Promise((resolve, reject) => {
    CommunitySchema.find({ active: true }).sort({ weight: -1 }).exec((err, allCommunities) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunities);
    });
  });
}

module.exports.getCommunityByShortId = (communitySid) => {
  return new Promise((resolve, reject) => {
    CommunitySchema.findOne({ sid: communitySid, active: true }).exec((err, community) => {
      if (err) {
        reject(err);
      }
      resolve(community);
    });
  });
}
