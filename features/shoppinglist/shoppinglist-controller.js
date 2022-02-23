const Boom = require('boom');
const shoppinglistDB = require('./shoppinglist-model');
const responseMessages = require('../utils/messages');
const userDB = require('../user/user-model'); // eslint-disable-line
const dealDB = require('../deal/deal-model'); // eslint-disable-line
const familyDB = require('../family/family-model');
const receiptDB = require('../receipt/receipt-model');

module.exports.addShoppinglist = async shoppinglist => {
  try {
    const alreadyAddedShoppinglist = await shoppinglistDB.getShoppinglistByName(shoppinglist.name, shoppinglist.family);
    if (alreadyAddedShoppinglist.length > 0) {
      throw Boom.forbidden(responseMessages.shoppinglist.SAME_SHOPPINGLIST_NAME_EXIST);
    }
    const createdShoppinglist = shoppinglistDB.addShoppinglist(shoppinglist);
    return createdShoppinglist;
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_ADDING_SHOPPINGLIST, error);
  }
}

module.exports.updateShoppinglist = async (updateData, shoppinglistId) => {
  try {
    if (updateData.name) {
      const alreadyAddedShoppinglist = await shoppinglistDB.getShoppinglistByName(updateData.name, updateData.family);
      if (alreadyAddedShoppinglist.length > 0) {
        throw Boom.forbidden(responseMessages.shoppinglist.SAME_SHOPPINGLIST_NAME_EXIST);
      }
    }

    const updatedShoppinglist = await shoppinglistDB.updateShoppinglist(updateData, shoppinglistId);
    return updatedShoppinglist;
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_UPDATING_SHOPPINGLIST, error);
  }
}

module.exports.deleteShoppinglist = async shoppinglistId => {
  try {
    const shoppinglist = await shoppinglistDB.deleteShoppinglist(shoppinglistId);
    return shoppinglist;
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_DELETING_SHOPPINGLIST, error);
  }
}

module.exports.getAllShoppinglists = async family => {
  try {
    const allShoppinglists = await shoppinglistDB.getAllShoppinglists(family);
    let frequentProducts = [];
    // const frequentProducts = getFrequentProductList(allShoppinglists);
    const allFamilyReceipts = await receiptDB.getReceiptByFamilyId(family);
    if (allFamilyReceipts.length > 0) {
      const allProductsMerged = [];
      for (let k = 0; k < allFamilyReceipts.length; k++) {
        for (let l = 0; l < allFamilyReceipts[k].products.length; l++) {
          allProductsMerged.push(allFamilyReceipts[k].products[l]);
        }
      }
      frequentProducts = getFrequentProductList(allProductsMerged);
    }
    return {
      allShoppinglists,
      frequentProducts
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_GETTING_ALL_SHOPPINGLISTS, error);
  }
}

module.exports.addToMyShoppinglists = async body => {
  try {
    const { shoppinglist, user } = body;
    const family = await familyDB.getFamilyByAdminId(user);
    if (family.length === 0) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const updatedFamily = await familyDB.updateFamilyShoppinglists(shoppinglist, family[0]._id);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_ADDING_TO_MY_SHOPPINGLISTS, error);
  }
}

module.exports.removeFromMyShoppinglists = async body => {
  try {
    const { shoppinglist, user } = body;
    const family = await familyDB.getFamilyByAdminId(user);
    if (family.length === 0) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const updatedFamily = await familyDB.updateFamilyShoppinglists(shoppinglist, family[0]._id);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_REMOVING_FROM_MY_SHOPPINGLISTS, error);
  }
}

module.exports.formatShoppingListProductsModel = async () => {
  try {
    const shoppinglists = await shoppinglistDB.getAllShoppinglistsForRestructure();
    const $promises = [];
    for (let i = 0; i < shoppinglists.length; i++) {
      const products = [];
      for (let j = 0; j < shoppinglists[i].products.length; j++) {
        products.push({
          name: shoppinglists[i].products[j],
          purchased: false
        });
      }
      $promises.push(shoppinglistDB.updateShoppinglist({ products }, shoppinglists[i]._id));
    }
    await Promise.all($promises);
    return {};
  } catch (error) {
    throw Boom.forbidden(responseMessages.shoppinglist.ERROR_REMOVING_FROM_MY_SHOPPINGLISTS, error);
  }
}

const getFrequentProductList = allReceiptProducts => {
  const allProducts = [];
  for (let i = 0; i < allReceiptProducts.length; i++) {
    if (allReceiptProducts[i].product && allReceiptProducts[i].product.name) {
      allProducts.push(allReceiptProducts[i].product.name);
    } else if (allReceiptProducts[i].description !== '') {
      allProducts.push(allReceiptProducts[i].description);
    }
  }
  if (allProducts.length > 0) { // removing the duplicate ones
    const uniq = allProducts
      .map(product => ({ count: 1, product }))
      .reduce((a, b) => {
        a[b.product] = (a[b.product] || 0) + b.count;
        return a;
      }, {});
    const sortable = [];
    // eslint-disable-next-line guard-for-in
    for (const p in uniq) {
      sortable.push([p, uniq[p]]);
    }

    sortable.sort((a, b) => b[1] - a[1]);
    const sortedList = [];
    for (let j = 0; j < sortable.length; j++) {
      sortedList.push(sortable[j][0]);
    }
    return sortedList;
  }
  return [];
}
