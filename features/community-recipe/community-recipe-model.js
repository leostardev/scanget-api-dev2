const CommunityRecipeSchema = require('./community-recipe-schema');

module.exports.addCommunityRecipe = (communityRecipeData) => {
  const communityRecipe = new CommunityRecipeSchema(communityRecipeData);
  return new Promise((resolve, reject) => {
    communityRecipe.save((err, createdCommunityRecipe) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityRecipe);
    });
  });
}

module.exports.updateCommunityRecipe = (updateCommunityRecipeData, communityRecipeId) => {
  return new Promise((resolve, reject) => {
    CommunityRecipeSchema.findOneAndUpdate({ _id: communityRecipeId }, updateCommunityRecipeData, { new: true }, (err, updatedCommunityRecipe) => {
      if (err) {
        reject(err);
      }
      resolve(updatedCommunityRecipe);
    });
  });
}

module.exports.deleteCommunityRecipe = (communityRecipeId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    CommunityRecipeSchema.findByIdAndUpdate(communityRecipeId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getCommunityRecipeById = (communityRecipeId) => {
  return new Promise((resolve, reject) => {
    CommunityRecipeSchema.findById(communityRecipeId, (err2, data) => {
      if (err2) {
        reject(err2);
      }
      resolve(data);
    });
  });
}

module.exports.getAllCommunityRecipes = () => {
  return new Promise((resolve, reject) => {
    CommunityRecipeSchema.find({ active: true }, (err, allCommunityRecipes) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityRecipes);
    });
  });
}

module.exports.getCommunityRecipesByCommunityId = (community) => {
  return new Promise((resolve, reject) => {
    CommunityRecipeSchema.find({
      community,
      active: true,
      approved: true,
      deactivated: false
    }).sort({ weight: -1 }).exec((err, allCommunityRecipes) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityRecipes);
    });
  });
}

module.exports.getCommunityRecipesByCommunityIdForAdmin = (community) => {
  return new Promise((resolve, reject) => {
    CommunityRecipeSchema.find({ community, active: true }).sort({ weight: -1 }).exec((err, allCommunityRecipes) => {
      if (err) {
        reject(err);
      }
      resolve(allCommunityRecipes);
    });
  });
}
