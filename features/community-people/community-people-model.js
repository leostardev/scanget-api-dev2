const CommunityPeopleSchema = require('./community-people-schema');

module.exports.addCommunityPeople = (communityPeopleData) => {
  const communityPeople = new CommunityPeopleSchema(communityPeopleData);
  return new Promise((resolve, reject) => {
    communityPeople.save((err, createdCommunityPeople) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityPeople);
    });
  });
}

module.exports.updateCommunityPeople = (updateCommunityPeopleData, communityPeopleId) => {
  return new Promise((resolve, reject) => {
    CommunityPeopleSchema.findOneAndUpdate({ _id: communityPeopleId }, updateCommunityPeopleData, { new: true }, (err, updatedCommunityPeople) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityPeople);
    });
  });
}

module.exports.deleteCommunityPeople = (communityPeopleId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityPeopleSchema.findByIdAndUpdate(communityPeopleId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllCommunityPeople = () => {
  return new Promise((resolve, reject) => {
    CommunityPeopleSchema.find({ active: true }, (err, allCommunityPeoples) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityPeoples);
    });
  });
}

module.exports.getCommunityPeopleByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityPeopleSchema.findOne({ community, active: true }, (err, allCommunityPeoples) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityPeoples);
    });
  });
}
