const CommunityValueSchema = require('./community-value-schema');

module.exports.addCommunityValue = (communityValueData) => {
  const communityValue = new CommunityValueSchema(communityValueData);
  return new Promise((resolve, reject) => {
    communityValue.save((err, createdCommunityValue) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityValue);
    });
  });
}

module.exports.updateCommunityValue = (updateCommunityValueData, communityValueId) => {
  return new Promise((resolve, reject) => {
    CommunityValueSchema.findOneAndUpdate({ _id: communityValueId }, updateCommunityValueData, { new: true }, (err, updatedCommunityValue) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityValue);
    });
  });
}

module.exports.deleteCommunityValue = (communityValueId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityValueSchema.findByIdAndUpdate(communityValueId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllCommunityValues = () => {
  return new Promise((resolve, reject) => {
    CommunityValueSchema.find({ active: true }, (err, allCommunityValues) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityValues);
    });
  });
}

module.exports.getCommunityValueByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityValueSchema.findOne({ community, active: true }, (err, allCommunityValues) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityValues);
    });
  });
}
