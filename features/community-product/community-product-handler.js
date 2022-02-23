const Boom = require('boom');
const communityProductCtrl = require('./community-product-controller');
const { addCommunityProductSchema, updateCommunityProductSchema, deleteCommunityProductSchema, approveCommunityProductsSchema, addCommunityProductNutritionSchema, addCommunityProductNutritionItemsSchema, communityIdValidationSchema } = require('../utils/validation');

module.exports.addCommunityProduct = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    let validationError = addCommunityProductSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.nutritionInfo && body.nutritionInfo.measuringUnit) {
      validationError = addCommunityProductNutritionSchema(body.nutritionInfo);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
      body.nutritionInfo.measuringUnit = body.nutritionInfo.measuringUnit.trim();
      for (let i = 0; i < body.nutritionInfo.nutrients.length; i++) {
        validationError = addCommunityProductNutritionItemsSchema(body.nutritionInfo.nutrients[i]);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
        body.nutritionInfo.nutrients[i].name = body.nutritionInfo.nutrients[i].name.trim();
      }
    }
    body.description = body.description.trim();
    body.title = body.title.trim();
    const data = await communityProductCtrl.addCommunityProduct(currentUser.role === 'admin' ? { ...body, approved: true } : body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.updateCommunityProduct = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { communityProductId } = params;
    let validationError = updateCommunityProductSchema({ ...body, communityProductId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.nutritionInfo && body.nutritionInfo.measuringUnit) {
      validationError = addCommunityProductNutritionSchema(body.nutritionInfo);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
      body.nutritionInfo.measuringUnit = body.nutritionInfo.measuringUnit.trim();
      for (let i = 0; i < body.nutritionInfo.nutrients.length; i++) {
        validationError = addCommunityProductNutritionItemsSchema(body.nutritionInfo.nutrients[i]);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
        body.nutritionInfo.nutrients[i].name = body.nutritionInfo.nutrients[i].name.trim();
      }
    }
    if (body.description) {
      body.description = body.description.trim();
    }
    if (body.title) {
      body.title = body.title.trim();
    }
    const data = await communityProductCtrl.updateCommunityProduct(body, communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deleteCommunityProduct = async (req, res, next) => {
  try {
    const { params } = req;

    const { communityProductId } = params;
    const validationError = deleteCommunityProductSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityProductCtrl.deleteCommunityProduct(communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCommunityProductById = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityProductId } = params;
    const data = await communityProductCtrl.getCommunityProductById(communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllCommunityProducts = async (req, res, next) => {
  try {
    const data = await communityProductCtrl.getAllCommunityProducts();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.approveCommunityProducts = async (req, res, next) => {
  try {
    const { params } = req;

    const { communityProductId } = params;
    const validationError = approveCommunityProductsSchema({ communityProductId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityProductCtrl.approveCommunityProduct(communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.activateCommunityProducts = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityProductId } = params;
    const validationError = approveCommunityProductsSchema({ communityProductId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityProductCtrl.activateCommunityProducts(communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.deactivateCommunityProducts = async (req, res, next) => {
  try {
    const { params } = req;
    const { communityProductId } = params;
    const validationError = approveCommunityProductsSchema({ communityProductId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityProductCtrl.deactivateCommunityProducts(communityProductId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}

module.exports.getCommunityProductsByCommunityId = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { communityId } = params;
    const validationError = communityIdValidationSchema({ communityId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await communityProductCtrl.getCommunityProductsByCommunityId(communityId, currentUser);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }

}
