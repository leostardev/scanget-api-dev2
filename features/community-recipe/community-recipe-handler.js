const Boom = require('boom');
const communityRecipeCtrl = require('./community-recipe-controller');
const { addCommunityRecipeSchema, updateCommunityRecipeSchema, deleteCommunityRecipeSchema, approveCommunityRecipesSchema, communityIdValidationSchema, addCommunityRecipeIngredientsItemsSchema } = require('../utils/validation');

module.exports.addCommunityRecipe = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    let validationError = addCommunityRecipeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    for (let i = 0; i < body.ingredients.length; i++) {
      validationError = addCommunityRecipeIngredientsItemsSchema(body.ingredients[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
      body.ingredients[i].name = body.ingredients[i].name.trim();
    }
    body.description = body.description.trim();
    body.title = body.title.trim();
    const data = await communityRecipeCtrl.addCommunityRecipe(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityRecipe = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityRecipeId } = params;
    const validationError = updateCommunityRecipeSchema({ ...body, communityRecipeId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    if (body.title) {
      body.title = body.title.trim();
    }
    const data = await communityRecipeCtrl.updateCommunityRecipe(body, communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityRecipe = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityRecipeId } = params;
    const validationError = deleteCommunityRecipeSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityRecipeCtrl.deleteCommunityRecipe(communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityRecipeById = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityRecipeId } = params;
    const data = await communityRecipeCtrl.getCommunityRecipeById(communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllCommunityRecipes = async (req, res, next) => {
  try {
    const data = await communityRecipeCtrl.getAllCommunityRecipes();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityRecipes = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityRecipeId } = params;
    const validationError = approveCommunityRecipesSchema({ communityRecipeId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityRecipeCtrl.approveCommunityRecipe(communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deactivateCommunityRecipes = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityRecipeId } = params;
    const validationError = approveCommunityRecipesSchema({ communityRecipeId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityRecipeCtrl.deactivateCommunityRecipes(communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.activateCommunityRecipes = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityRecipeId } = params;
    const validationError = approveCommunityRecipesSchema({ communityRecipeId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityRecipeCtrl.activateCommunityRecipes(communityRecipeId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityRecipesByCommunityId = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityRecipeCtrl.getCommunityRecipesByCommunityId(communityId, currentUser);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}
