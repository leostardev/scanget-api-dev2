const Boom = require('boom');
const walletTransactionCtrl = require('./wallet-transaction-controller');
// const { } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.syncWalletTransactions = async (req, res, next) => {
  try {
    const { body } = req;
    const data = await walletTransactionCtrl.syncWalletTransactions(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(Boom.internal(responseMessages.walletTransactions.ERROR_SYCING_WALLET_TRANSACTIONS, e));
  }
}

module.exports.getAllWalletTransactions = async (req, res, next) => {
  try {
    const { body } = req;
    const data = await walletTransactionCtrl.getAllWalletTransactions(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(Boom.internal(responseMessages.walletTransactions.ERROR_GETTING_ALL_WALLET_TRANSACTIONS, e));
  }
}

module.exports.getUserAllWalletTransactions = async (req, res, next) => {
  try {
    let data;
    const { params, currentUser, queryParams } = req;
    if (currentUser.role === 'admin') {
      data = await walletTransactionCtrl.getUserWalletTransactions({ user: params.userId }, queryParams, true);
    } else {
      data = await walletTransactionCtrl.getUserWalletTransactions({ user: params.userId }, queryParams);
    }
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(Boom.internal(responseMessages.walletTransactions.ERROR_GETTING_USER_ALL_WALLET_TRANSACTIONS, e));
  }
}

module.exports.getUserWalletTransactionsSummary = async (req, res, next) => {
  try {
    const { params } = req;
    const data = await walletTransactionCtrl.getUserWalletTransactionsSummary({ user: params.userId });
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(Boom.internal(responseMessages.walletTransactions.ERROR_GETTING_USER_WALLET_TRANSACTIONS_SUMMARY, e));
  }
}
