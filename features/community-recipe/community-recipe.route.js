let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityRecipeHandler = require('./community-recipe-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityRecipeHandler.addCommunityRecipe);

router.route(`/:communityRecipeId`).put(verify.verifyAdminOrClientAdmin, communityRecipeHandler.updateCommunityRecipe);

router.route(`/:communityRecipeId`).delete(verify.verifyAdminOrClientAdmin, communityRecipeHandler.deleteCommunityRecipe);

router.route(`/:communityRecipeId`).get(verify.verifyUser, communityRecipeHandler.getCommunityRecipeById);

router.route(``).get(verify.verifyUser, communityRecipeHandler.getAllCommunityRecipes);

router.route(`/community/:communityId`).get(verify.verifyUser, communityRecipeHandler.getCommunityRecipesByCommunityId);

router.route(`/approve/:communityRecipeId`).get(verify.verifyAdmin, communityRecipeHandler.approveCommunityRecipes);

router.route(`/activate/:communityRecipeId`).get(verify.verifyAdminOrClientAdmin, communityRecipeHandler.activateCommunityRecipes);

router.route(`/deactivate/:communityRecipeId`).get(verify.verifyAdminOrClientAdmin, communityRecipeHandler.deactivateCommunityRecipes);

module.exports = router;
