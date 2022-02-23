const Boom = require('boom');
const walletCtrl = require('./wallet-controller');
const { getWalletByUserIdSchema, updateAmountToWalletSchema } = require('../utils/validation');

module.exports.getWalletByUserId = async (req, res, next) => { // eslint-disable-line
  try {
    const { params } = req;
    const validationError = getWalletByUserIdSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { user } = params;
    const wallet = await walletCtrl.getWalletByUserId(user);
    res.json({
      success: true,
      data: wallet
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateAmountToWallet = async (req, res, next) => { // eslint-disable-line
  try {
    const { params, body } = req;
    const validationError = updateAmountToWalletSchema({ ...params, ...body });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const wallet = await walletCtrl.updateAmountToWallet(body, params);
    res.json({
      success: true,
      data: wallet
    });
  } catch (e) {
    return next(e);
  }
}

