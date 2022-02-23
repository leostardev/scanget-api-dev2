const Boom = require('boom');
const categoryDB = require('./category-model');
const responseMessages = require('../utils/messages');
const userDB = require('../user/user-model'); // eslint-disable-line
const dealDB = require('../deal/deal-model');
const familyDB = require('../family/family-model');
const sectorDB = require('../sector/sector-model');

module.exports.addCategory = async (category, sectorId) => {
  try {
    const alreadyAddedCategory = await categoryDB.getCategoryByName(category.name);
    if (alreadyAddedCategory.length > 0) {
      throw Boom.forbidden(responseMessages.category.SAME_CATEGORY_NAME_EXIST);
    }
    const createdCategory = await categoryDB.addCategory({ name: category.name });
    console.log(createdCategory);
    console.log(sectorId);
    await sectorDB.addCategoryToSector(sectorId, createdCategory._id);
    return createdCategory;
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_ADDING_CATEGORY, error);
  }
}

module.exports.updateCategory = async (updateData, categoryId) => {
  try {
    if (updateData.name) {
      const alreadyAddedCategory = await categoryDB.getCategoryByName(updateData.name);
      if (alreadyAddedCategory.length > 0) {
        throw Boom.forbidden(responseMessages.category.SAME_CATEGORY_NAME_EXIST);
      }
    }
    const updatedCategory = await categoryDB.updateCategory(updateData, categoryId);
    return updatedCategory;
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_UPDATING_CATEGORY, error);
  }
}

module.exports.deleteCategory = async (categoryId) => {
  try {
    await categoryDB.deleteCategory(categoryId);
    return {
      message: responseMessages.category.SUCCESS_DELETE_CATEGORY
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_DELETING_CATEGORY, error);
  }
}

module.exports.getAllCategories = async (isAdmin) => {
  try {
    const allCategories = await categoryDB.getAllCategories();
    if (isAdmin) {
      const updatedCategories = await attachSectorToCategories(allCategories);
      return updatedCategories;
    }
    const $promises = [];
    for (let i = 0; i < allCategories.length; i++) {
      $promises.push(dealDB.getDealsCountWrtCategories(allCategories[i]._id));
    }
    const dealsCount = await Promise.all($promises);
    const updatedCategoryList = [];
    for (let j = 0; j < dealsCount.length; j++) {
      const category = { ...allCategories[j] };
      if (dealsCount[j] > 0) {
        category.activeDeals = true;
        updatedCategoryList.push(category);
      } else {
        category.activeDeals = false;
        updatedCategoryList.push(category);
      }
    }
    updatedCategoryList.sort((a, b) => {
      const textA = a.name.toUpperCase();
      const textB = b.name.toUpperCase();
      // eslint-disable-next-line no-nested-ternary
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return updatedCategoryList;
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_GETTING_ALL_CATEGORIES, error);
  }
}
module.exports.addToMyCategories = async (body) => {
  try {
    const { category, user } = body;
    const family = await familyDB.getFamilyByAdminId(user);
    if (family.length === 0) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const updatedFamily = await familyDB.updateFamilyCategories(category, family[0]._id);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_ADDING_TO_MY_CATEGORIES, error);
  }
}

module.exports.removeFromMyCategories = async (body) => {
  try {
    const { category, user } = body;
    const family = await familyDB.getFamilyByAdminId(user);
    if (family.length === 0) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const updatedFamily = await familyDB.updateFamilyCategories(category, family[0]._id);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.category.ERROR_REMOVING_FROM_MY_CATEGORIES, error);
  }
}

const attachSectorToCategories = async (allCategories) => {
  const updatedCategories = [];
  let allSectors = await sectorDB.getAllSectors(true);
  allSectors = allSectors.map(sector => ({
    ...sector,
    categories: sector.categories.map(category => category.toString())
  }));
  for (let i = 0; i < allCategories.length; i++) {
    let sector = '';
    for (let j = 0; j < allSectors.length; j++) {
      if (allSectors[j].categories.includes(allCategories[i]._id.toString())) {
        if (sector !== '') {
          sector += `, ${allSectors[j].name}`;
        } else {
          sector = `${allSectors[j].name}`;
        }
      }
    }
    updatedCategories.push({
      ...allCategories[i],
      sector
    });
  }
  return updatedCategories;
}
