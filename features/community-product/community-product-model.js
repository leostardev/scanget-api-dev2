const CommunityProductSchema = require('./community-product-schema');

module.exports.addCommunityProduct = (communityProductData) => {
  const communityProduct = new CommunityProductSchema(communityProductData);
  return new Promise((resolve, reject) => {
    communityProduct.save((err, createdCommunityProduct) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityProduct);
    });
  });
}

module.exports.updateCommunityProduct = (updateCommunityProductData, communityProductId) => {
  return new Promise((resolve, reject) => {
    CommunityProductSchema.findOneAndUpdate({ _id: communityProductId }, updateCommunityProductData, { new: true }, (err, updatedCommunityProduct) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityProduct);
    });
  });
}

module.exports.deleteCommunityProduct = (communityProductId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityProductSchema.findByIdAndUpdate(communityProductId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getCommunityProductById = (communityProductId) => {
  return new Promise((resolve, reject) => {
    CommunityProductSchema.findById(communityProductId, (err2, data) => {
      if (err2) {
        reject(err2);
      }
      resolve(data);
    });
  });
}

module.exports.getAllCommunityProducts = () => {
  return new Promise((resolve, reject) => {
    CommunityProductSchema.find({ active: true }, (err, allCommunityProducts) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityProducts);
    });
  });
}

module.exports.getCommunityProductsByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityProductSchema.find({
      community,
      active: true,
      approved: true,
      deactivated: false
    }).sort({ weight: -1 }).exec((err, allCommunityProducts) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityProducts);
    });
  });
}

module.exports.getCommunityProductsByCommunityIdForAdmin = (community) => {
  return new Promise((resolve, reject) => {
    CommunityProductSchema.find({ community, active: true }).sort({ weight: -1 }).exec((err, allCommunityProducts) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityProducts);
    });
  });
}
