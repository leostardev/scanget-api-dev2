const Boom = require('boom');
const categoryCtrl = require('./category-controller');
const { addCategorySchema, updateCategorySchema, deleteCategorySchema, addToMyCategoriesSchema, removeFromMyCategoriesSchema } = require('../utils/validation');

module.exports.addCategory = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addCategorySchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await categoryCtrl.addCategory(body, body.sector);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateCategory = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { categoryId } = params;
    const validationError = updateCategorySchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await categoryCtrl.updateCategory(body, categoryId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteCategory = async (req, res, next) => {
  try {
    const { params } = req;
    const { categoryId } = params;
    const validationError = deleteCategorySchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await categoryCtrl.deleteCategory(categoryId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllCategories = async (req, res, next) => {
  try {
    let isAdmin = false;
    const { currentUser } = req;
    if (currentUser.role === 'admin' || currentUser.role === 'client-admin' || currentUser.role === 'client-user') {
      isAdmin = true;
    }
    const data = await categoryCtrl.getAllCategories(isAdmin);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.addToMyCategories = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addToMyCategoriesSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await categoryCtrl.addToMyCategories(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.removeFromMyCategories = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = removeFromMyCategoriesSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await categoryCtrl.removeFromMyCategories(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
