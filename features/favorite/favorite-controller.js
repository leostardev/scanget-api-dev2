const Boom = require('boom');
const userDB = require('../user/user-model');
const responseMessages = require('../utils/messages');

module.exports.addToFavorite = async (user, dealId) => {
  try {
    const updatedUser = await userDB.addDealToUserFavorites(dealId, user);
    return updatedUser;
  } catch (error) {
    throw Boom.forbidden(responseMessages.favorite.ERROR_ADDING_DEAL_TO_FAVORITE, error);
  }
}
module.exports.removeFromFavorite = async (user, dealId) => {
  try {
    const updatedUser = await userDB.removeDealFromFavorite(dealId, user);
    return updatedUser;
  } catch (error) {
    throw Boom.forbidden(responseMessages.favorite.ERROR_REMOVING_DEAL_FROM_FAVORITES, error);
  }
}
