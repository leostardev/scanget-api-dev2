const Boom = require('boom');
const responseMessages = require('../utils/messages');
const walletDB = require('./wallet-model');

module.exports.createWallet = async (balance = 0) => {
  try {
    const walletData = {
      balance,
      transactions: []
    };
    const wallet = await walletDB.createWallet(walletData);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_CREATING_WALLET);
  }
}

module.exports.getWalletByUserId = async userId => {
  try {
    const wallet = await walletDB.getWalletByUserId(userId);
    console.log(wallet);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_GETTING_WALLET);
  }
}

module.exports.updateAmountToWallet = async body => {
  try {
    const { user, amount } = body;
    const wallet = await walletDB.updateAmountToWallet(user, amount);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_UPDATING_WALLET_AMOUNT, error);
  }
}

module.exports.attachFamilyToWallet = async (walletId, familyId) => {
  try {
    const wallet = await walletDB.attachFamilyToWallet(walletId, familyId);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_UPDATING_WALLET_AMOUNT, error);
  }
}

module.exports.getWalletByFamilyId = async familyId => {
  try {
    const wallet = await walletDB.getWalletByFamilyId(familyId);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_UPDATING_WALLET_AMOUNT, error); // #TODO
  }
}

module.exports.addAmountToWalletOnInviteAccept = async (walletId, amount) => {
  try {
    const wallet = await walletDB.addAmountToWalletOnInviteAccept(walletId, amount);
    return wallet;
  } catch (error) {
    return Boom.forbidden(responseMessages.wallet.ERR_UPDATING_WALLET_AMOUNT, error); // #TODO
  }
}
