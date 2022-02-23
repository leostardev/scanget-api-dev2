const Boom = require('boom');
const favoriteCtrl = require('./favorite-controller');
const { addToFavoriteSchema, removeFromFavoriteSchema } = require('../utils/validation');

module.exports.addToFavorite = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addToFavoriteSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await favoriteCtrl.addToFavorite(body.user, body.deal);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.removeFromFavorite = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = removeFromFavoriteSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await favoriteCtrl.removeFromFavorite(body.user, body.deal);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
