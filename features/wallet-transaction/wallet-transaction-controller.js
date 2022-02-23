const Boom = require('boom');
const moment = require('moment');
const mongoose = require('mongoose');
const walletTransactionDB = require('./wallet-transaction-model');
const responseMessages = require('../utils/messages');
const receiptDB = require('../receipt/receipt-model');
const transactionsDB = require('../transaction/transaction-model');
const communityPointsDB = require('../community-points/community-points-model');
const userDB = require('../user/user-model');
const notificationDB = require('../notification/notification-model');

module.exports.getAllWalletTransactions = async (body) => {
  try {
    const query = {
      ...body
    };
    let transactions = await walletTransactionDB.getAllWalletTransactions(query);
    return transactions;
  } catch (error) {
    throw Boom.forbidden(responseMessages.walletTransactions.ERROR_GETTING_ALL_WALLET_TRANSACTIONS);
  }
}

module.exports.getUserWalletTransactions = async (userQuery, queryParams, isAdmin) => {
  try {
    const userData = await userDB.getByUserId(userQuery.user, true);
    const query = {
      family: mongoose.Types.ObjectId(userData.family)
    };
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      const startDate = moment(new Date(queryParams.minDate)).utc().startOf('day').toDate();
      const endDate = moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate();
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      }
    }
    let transactions = await walletTransactionDB.getUserWalletTransactions(query, queryParams);
    if (isAdmin) {
      return transactions
    }
    transactions = transactions.map(transaction => {
      return {
        ...transaction,
        title: attachTitleToTransaction(transaction)
      }
    })
    return transactions;
  } catch (error) {
    throw Boom.forbidden(responseMessages.walletTransactions.ERROR_GETTING_ALL_WALLET_TRANSACTIONS);
  }
}

module.exports.getUserWalletTransactionsSummary = async body => {
  try {
    const query = {
      ...body
    };
    let transactions = await walletTransactionDB.getAllWalletTransactions(query);
    const responseData = {
      amountFromShopping: 0,
      amountFromStudies: 0,
      amountFromOthers: 0,
      amountFromInvites: 0,
      amountFromCommunityPoints: 0,
      totalPayment: 0
    }
    transactions.map(transaction => {
      if (transaction.dType === 'receipt.accept') {
        responseData.amountFromShopping += transaction.amount
      } else if (transaction.dType === 'points.redeem') {
        responseData.amountFromCommunityPoints += transaction.amount
      } else if (transaction.dType === 'bank.transfer') {
        responseData.totalPayment += transaction.amount
      } else if (transaction.dType === 'reward.survey') {
        responseData.amountFromStudies += transaction.amount
      } else if (transaction.dType === 'invite.create') {
        responseData.amountFromInvites += transaction.amount
      } else {
        responseData.amountFromOthers += transaction.amount
      }
      return transaction;
    })
    return {
      amountFromShopping: parseFloat(responseData.amountFromShopping).toFixed(2),
      amountFromStudies: parseFloat(responseData.amountFromStudies).toFixed(2),
      amountFromOthers: parseFloat(responseData.amountFromOthers).toFixed(2),
      amountFromInvites: parseFloat(responseData.amountFromInvites).toFixed(2),
      totalPayment: parseFloat(responseData.totalPayment).toFixed(2),
      amountFromCommunityPoints: parseFloat(responseData.amountFromCommunityPoints).toFixed(2)
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.walletTransactions.ERROR_GETTING_ALL_WALLET_TRANSACTIONS);
  }
}

module.exports.syncWalletTransactions = async (body) => {
  try {
    if (body.key !== 'Qd23rdfv3t3f2c2323saf2r2') {
      throw new Error('Unauthorized');
    }
    const pointsPerEuro = body.pointsPerEuro || 300;
    let walletTransactions = [];
    const allAcceptedReceipts = await receiptDB.getAllUserPaymentsFromReceipts();
    console.log(allAcceptedReceipts)
    allAcceptedReceipts.map(receipt => {
      walletTransactions.push({
        dType: 'receipt.accept',
        description: 'Amount saved from receipt acceptance',
        meta: {
          receiptId: receipt._id,
          deals: receipt.deals ? [...receipt.deals.map(deal => {
            return {
              title: deal.title,
              _id: deal._id
            }
          })] : [],
          shop: receipt.retailer_info ? receipt.retailer_info.shop : ''
        },
        user: receipt.user,
        family: receipt.family,
        amount: receipt.savedAmount,
        isCredited: true,
        createdAt: receipt.receipt_date || receipt.updatedAt,
        updatedAt: receipt.receipt_date || receipt.updatedAt
      })
      return receipt;
    })
    const allBankTransactions = await transactionsDB.getAllBankTransactions()
    console.log(allBankTransactions)
    allBankTransactions.map(transaction => {
      if (transaction.user) {
        walletTransactions.push({
          dType: 'bank.transfer',
          description: `Payment ${moment(transaction.createdAt).subtract(1, 'month').format('MMM YYYY')}`,
          meta: {
            transactionId: transaction._id,
            bank_name: transaction.bank_name,
            account_title: transaction.account_title,
            iban_no: transaction.iban_no,
            swift_code: transaction.swift_code,
          },
          user: transaction.user ? transaction.user._id : null,
          family: transaction.user ? transaction.user.family : null,
          amount: transaction.amount,
          isCredited: false,
          createdAt: transaction.createdAt,
          updatedAt: transaction.createdAt
        })
      }
      return transaction;
    })
    const allRedeemPointsTransactions = await communityPointsDB.getAllRedeemedCommunityPoints();
    allRedeemPointsTransactions.map(redeemPoint => {
      if (redeemPoint.points >= pointsPerEuro) {
        const amount = parseInt(redeemPoint.points / pointsPerEuro);
        walletTransactions.push({
          dType: 'points.redeem',
          description: `${redeemPoint.community ? `${redeemPoint.community.name} Points` : `Community Points`}`,
          meta: {
            communityPointsId: redeemPoint._id,
            community: redeemPoint.community ? redeemPoint.community._id : null
          },
          user: redeemPoint.family.familyAdmin,
          family: redeemPoint.family._id,
          amount: amount,
          isCredited: true,
          createdAt: redeemPoint.createdAt,
          updatedAt: redeemPoint.createdAt
        })
      }
      return redeemPoint;
    })

    const $rewardInviteBonusPromises = [];
    const allInviteAcceptBonusNotifications = await notificationDB.getAllNotificationWithKeyword('Your have been awarded with €');
    allInviteAcceptBonusNotifications.map(inviteBonus => {
      $rewardInviteBonusPromises.push(getInviteBonusTransaction(inviteBonus))
      return inviteBonus;
    })
    const inviteBonusTranasctions = await Promise.all($rewardInviteBonusPromises)
    walletTransactions = [...walletTransactions, ...inviteBonusTranasctions];
    const syncedWalletTranscations = await walletTransactionDB.createBulkWalletTransactions(walletTransactions)
    return syncedWalletTranscations;
  } catch (error) {
    throw Boom.forbidden(responseMessages.walletTransactions.ERROR_GETTING_ALL_WALLET_TRANSACTIONS);
  }
}

function getInviteBonusTransaction(transaction) {
  return new Promise(async (resolve) => {
    const user = await userDB.getByUserId(transaction.user[0], true);
    resolve({
      dType: 'invite.create',
      description: 'Amount added on inviting others',
      meta: transaction.meta,
      user: user ? user._id : null,
      family: user ? user.family : null,
      amount: 2,
      isCredited: false,
      createdAt: transaction.createdAt,
      updatedAt: transaction.createdAt
    })
  })
}

function attachTitleToTransaction(transaction) {
  switch (transaction.dType) {
    case 'receipt.accept':
      return 'Receipt Accepted';
    case 'invite.create':
      return 'Invite Bonus';
    case 'points.redeem':
      return `Redeemed ${transaction.description}`;
    case 'bank.transfer':
      return transaction.description;
    case 'reward.survey':
      return 'Survey Completion Reward';
    default:
      return '';
  }
}
