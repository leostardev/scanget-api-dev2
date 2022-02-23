const Boom = require('boom');
const retailerDB = require('./retailer-model');
const responseMessages = require('../utils/messages');
const dealDB = require('../deal/deal-model');

module.exports.addRetailer = async (retailer) => {
  try {
    const createdRetailer = await retailerDB.addRetailer(retailer);
    return createdRetailer;
  } catch (error) {
    throw Boom.forbidden(responseMessages.retailer.ERROR_ADDING_RETAILER, error);
  }
}

module.exports.updateRetailer = async (updateData, retailerId) => {
  try {
    const updatedRetailer = await retailerDB.updateRetailer(updateData, retailerId);
    return updatedRetailer;
  } catch (error) {
    throw Boom.forbidden(responseMessages.retailer.ERROR_UPDATING_RETAILER, error);
  }
}

module.exports.deleteRetailer = async (retailerId) => {
  try {
    await retailerDB.deleteRetailer(retailerId);
    const deals = await dealDB.getDealByRetailerId(retailerId);
    for (let i = 0; i < deals.length; i++) {
      deals[i].otherSavings = deals[i].otherSavings.filter((savings) => {
        if (savings.retailer.toString() === retailerId.toString()) {
          return false;
        }
        return true;
      });
    }
    const dealIds = deals.map(deal => deal._id);
    const $promises = [];
    for (let j = 0; j < dealIds.length; j++) {
      $promises.push(dealDB.editDeal(deals[j], dealIds[j]));
    }
    await Promise.all($promises);
    return {
      message: responseMessages.retailer.SUCCESS_DELETE_RETAILER
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.retailer.ERROR_DELETING_RETAILER, error);
  }
}

module.exports.getAllRetailers = async () => {
  try {
    const allRetailers = await retailerDB.getAllRetailers();
    return allRetailers;
  } catch (error) {
    throw Boom.forbidden(responseMessages.retailer.ERROR_GETTING_ALL_RETAILERS, error);
  }
}

module.exports.deleteRetailerShop = async (shopName, retailerId) => {
  try {
    const retailer = await retailerDB.getRetailerById(retailerId);
    if (!retailer) {
      throw Boom.forbidden('Retailer does not exists');
    }
    if (retailer.shops.length <= 1) {
      throw Boom.forbidden(responseMessages.retailer.SHOP_EMPTY);
    }
    retailer.shops = retailer.shops.filter((shop) => {
      if (shop.name !== shopName) {
        return true;
      }
      return false;
    });
    const updatedRetailer = await retailerDB.updateRetailer(retailer, retailerId);
    // delete shop = require(other savings
    let deals = await dealDB.getDealByRetailerId(retailerId);
    deals = deals.filter((deal) => {
      for (let i = 0; i < deal.otherSavings.length; i++) {
        if (deal.otherSavings[i].shop === shopName) {
          return true;
        }
      }
      return false;
    });
    deals.forEach((deal) => {
      const otherSavings = [];
      deal.otherSavings.forEach((item) => {
        if (item.shop !== shopName) {
          otherSavings.push(item);
        }
      });
      deal.otherSavings = otherSavings;
    });
    const dealIds = deals.map(deal => deal._id);
    const $promises = [];
    for (let j = 0; j < dealIds.length; j++) {
      $promises.push(dealDB.editDeal(deals[j], dealIds[j]));
    }
    await Promise.all($promises);
    return updatedRetailer;
  } catch (error) {
    throw Boom.forbidden(responseMessages.retailer.ERROR_DELETING_SHOP, error);
  }
}
