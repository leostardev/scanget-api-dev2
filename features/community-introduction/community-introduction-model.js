const CommunityIntroductionSchema = require('./community-introduction-schema');

module.exports.addCommunityIntroduction = (communityIntroductionData) => {
  const communityIntroduction = new CommunityIntroductionSchema(communityIntroductionData);
  return new Promise((resolve, reject) => {
    communityIntroduction.save((err, createdCommunityIntroduction) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityIntroduction);
    });
  });
}

module.exports.updateCommunityIntroduction = (updateCommunityIntroductionData, communityIntroductionId) => {
  return new Promise((resolve, reject) => {
    CommunityIntroductionSchema.findOneAndUpdate({ _id: communityIntroductionId }, updateCommunityIntroductionData, { new: true }, (err, updatedCommunityIntroduction) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityIntroduction);
    });
  });
}

module.exports.deleteCommunityIntroduction = (communityIntroductionId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityIntroductionSchema.findByIdAndUpdate(communityIntroductionId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getCommunityIntroductionByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityIntroductionSchema.findOne({ community, active: true }, (err, communityIntroduction) => {
      if (err) {
        reject(err);
      }
      resolve(communityIntroduction);
    });
  });
}

module.exports.getAllCommunityIntroduction = () => {
  return new Promise((resolve, reject) => {
    CommunityIntroductionSchema.find({ active: true }, (err, allCommunityIntroduction) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityIntroduction);
    });
  });
}
