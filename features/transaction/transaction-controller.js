const Boom = require('boom');
const moment = require('moment');
const transactionDB = require('./transaction-model');
const responseMessages = require('../utils/messages');
const walletDB = require('../wallet/wallet-model');
const familyDB = require('../family/family-model');
const userDB = require('../user/user-model');
const { sendNotification } = require('../utils/notification/notification');
const paymentDB = require('../payment/payment-model');
const receiptDB = require('../receipt/receipt-model');
const walletTransactionDB = require('../wallet-transaction/wallet-transaction-model');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');

module.exports.createTransaction = async body => {
  let pendingTransactionAmount;
  try {
    const { amount, user } = body;
    if (amount === 0) {
      throw Boom.forbidden(responseMessages.transaction.INVALID_AMOUNT); // TODO
    }
    const userWallet = await walletDB.getWalletByUserId(user);
    pendingTransactionAmount = await getPendingTransactionAmountOfUser(user);
    const { balance } = userWallet;
    if ((pendingTransactionAmount + amount) > balance) {
      throw Boom.forbidden(`${responseMessages.transaction.NOT_ENOUGH_AMOUNT_TO_CREATE_TRASACTION} , Pending transactions totals: ${pendingTransactionAmount}`);
    }
    const data = await transactionDB.createTransaction(body);
    if (body.dType === 'transfer') {
      const family = await familyDB.getFamilyById(userWallet.family);
      if (family.accountDetails && family.accountDetails.account_title) {
        const accountDetails = {
          account_title: body.account_title,
          bank_name: body.bank_name,
          swift_code: body.swift_code,
          iban_no: body.iban_no,
        };
        await familyDB.updateFamily({ accountDetails }, userWallet.family);
      }
    }
    await walletDB.addTransactionToUserWallet(data.user, data._id, amount);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERR_CREATING_TRANSACTION, error);
  }
}

module.exports.approveTransaction = async (body, transactionId) => {
  try {
    const data = await transactionDB.updateTransaction(body, transactionId);
    const amount = parseFloat(data.amount) * -1;
    await walletDB.updateAmountToWalletByUserId(data.user, amount, data.amount);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_UPDATING_TRANSACTION);
  }
}

module.exports.deleteTransaction = async transactionId => {
  try {
    await transactionDB.deleteTransaction(transactionId);
    return {
      message: responseMessages.transaction.SUCCESS_DELETE_TRANSACTION
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_DELETING_TRANSACTION);
  }
}

module.exports.getAllTransactions = async (body, queryParams, isAdmin) => {
  try {
    let data;
    //    mode: joi.string().allow(['transactions', 'summary'])
    if (body.mode === 'summary') {
      const familyUser = await userDB.findByMongoId(body.user);
      if (!queryParams.minDate || !queryParams.maxDate) {
        data = receiptDB.getReceiptDataByCategory({ family: familyUser.family });
      } else {
        const period = getDateRange(queryParams.minDate, queryParams.maxDate);
        data = receiptDB.getReceiptDataByCategory({ family: familyUser.family }, period);
      }
      // const family = await familyDB.getFamilyById(familyUser.family);
      // const familyMembers = family.familyMembers.map(member => member._id);
      // body.user = { $in: familyMembers };
    } else if (queryParams.scope === 'full' || !queryParams.minDate || !queryParams.maxDate) {
      data = await transactionDB.getAllTransactions(body, null, isAdmin);
    } else {
      const period = getDateRange(queryParams.minDate, queryParams.maxDate);
      data = await transactionDB.getAllTransactions(body, period, false);
    }
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_GETTING_ALL_TRANSACTIONS, error);
  }
}

module.exports.getAllTransactionsCSV = async (body, queryParams, isAdmin) => {
  try {
    let data;
    if (queryParams.scope === 'full' || !queryParams.minDate || !queryParams.maxDate) {
      data = await transactionDB.getAllTransactionsForCSV(body, null, isAdmin);
    } else {
      const period = getDateRange(queryParams.minDate, queryParams.maxDate);
      data = await transactionDB.getAllTransactionsForCSV(body, period, false);
    }
    console.log(data);
    data = data.map(transaction => {
      return {
        _id: transaction._id.toString(),
        userId: transaction.user ? transaction.user._id.toString() : '',
        createdAt: transaction.createdAt,
        username: transaction.user ? transaction.user.username : '',
        email: transaction.user ? transaction.user.email : '',
        dType: transaction.dType,
        status: transaction.status,
        active: transaction.active,
        amount: transaction.amount,
        bank_name: transaction.bank_name,
        account_title: transaction.account_title,
        iban_no: transaction.iban_no,
        swift_code: transaction.swift_code,
      }
    })
    const s3UploadData = await createAndUploadCsvToS3(data, `transactions-csv/${Date.now()}/transactions.csv`);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_GETTING_ALL_TRANSACTIONS, error);
  }
}
const getPendingTransactionAmountOfUser = async user => {
  try {
    const queryData = {
      user,
      status: 'Pending'
    };
    const data = await transactionDB.getAllTransactions(queryData, null, false);
    let amount = 0;
    for (let i = 0; i < data.length; i++) {
      amount = parseFloat(amount) + parseFloat(data[i].amount);
    }
    return amount;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_GETTING_ALL_TRANSACTIONS, error);
  }
}

module.exports.getPendingTransactionAmountOfUser = getPendingTransactionAmountOfUser

module.exports.notifySuccessfulPayment = async (payments, month, year) => {
  try {
    const successPaymentsList = [];
    for (let i = 0; i < payments.length; i++) {
      // subtract amount = require(outstanding balance
      if (payments[i].amount <= 0) {
        successPaymentsList.push({
          user: payments[i].familyAdmin,
          amount: payments[i].amount,
          status: 'Rejected',
          comments: 'Amount is less than or equal to 0'
        });
        continue;
      }
      // const previousData = await paymentDB.getMonthPaymentOfUser(month, year, payments[i].familyAdmin);
      const userWallet = await walletDB.getWalletByUserId(payments[i].familyAdmin)
      if (userWallet && (+(parseFloat(userWallet.balance).toFixed(2)) - payments[i].amount) < 0) {
        successPaymentsList.push({
          user: payments[i].familyAdmin,
          amount: payments[i].amount,
          status: 'Rejected',
          comments: 'User doesnot have enough amount in the wallet'
        });
        continue;
      }
      await walletDB.updateOutstandingBalanceOnSuccessfulPayment(payments[i].wallet, payments[i].amount);
      // Notify user about payments
      const notificationData = {
        user: payments[i].familyAdmin,
        amount: parseFloat(payments[i].amount).toFixed(2)
      };
      // record payment
      const paymentHistoryData = {
        amount: payments[i].amount,
        month,
        year,
        user: payments[i].familyAdmin,
        accountDetails: {
          account_title: payments[i].account_title,
          iban_no: payments[i].iban_no,
          bank_name: payments[i].bank_name,
          swift_code: payments[i].swift_code
        }
      };
      await paymentDB.createPayment(paymentHistoryData);
      await sendNotification(notificationData, 'transfer.successful', { wallet: payments[i].wallet });
      // add transaction history
      const transactionData = {
        bank_name: payments[i].bank_name,
        account_title: payments[i].account_title,
        iban_no: payments[i].iban_no,
        swift_code: payments[i].swift_code,
        user: payments[i].familyAdmin,
        status: 'Completed',
        amount: payments[i].amount,
        dType: payments[i].is_donating ? 'donate' : 'transfer'
      };
      const user = await userDB.getByUserId(payments[i].familyAdmin, true);
      const transaction = await transactionDB.createTransaction(transactionData);
      await walletTransactionDB.createWalletTransaction({
        dType: 'bank.transfer',
        description: `Payment ${moment(new Date(year, month - 1, 2)).format('MMM YYYY')}`,
        meta: {
          transactionId: transaction._id
        },
        user: payments[i].familyAdmin,
        family: user.family,
        amount: payments[i].amount,
        isCredited: false
      })
      successPaymentsList.push({
        user: payments[i].familyAdmin,
        amount: payments[i].amount,
        status: 'Completed',
        comments: 'Payment Successful'
      });
    }
    return successPaymentsList;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_GETTING_ALL_TRANSACTIONS, error);
  }
}

module.exports.notifySuccessfulPaymentFromCSV = async (payments, month, year) => {
  try {
    const successPaymentsList = [];
    const $promises = [];

    for (let i = 0; i < payments.length; i++) {
      // subtract amount = require(outstanding balance
      if (payments[i].amount <= 0) {
        successPaymentsList.push({
          user: payments[i].familyAdmin,
          amount: payments[i].amount,
          status: 'Rejected',
          comments: 'Amount is less than or equal to 0'
        });
        continue;
      }
      $promises.push(notifySuccessfulPaymentFromCSVSinglePayment(payments[i], month, year))
    }
    const responses = await Promise.all($promises);
    for (let i = 0; i < responses.length; i++) {
      successPaymentsList.push(responses[i]);
    }
    return successPaymentsList;
  } catch (error) {
    throw Boom.forbidden(responseMessages.transaction.ERROR_GETTING_ALL_TRANSACTIONS, error);
  }
}

function notifySuccessfulPaymentFromCSVSinglePayment(paymentData, month, year) {
  return new Promise(async (resolve) => {
    const userWallet = await walletDB.getWalletByUserId(paymentData.familyAdmin)
    console.log(+(parseFloat(userWallet.balance).toFixed(2)))
    console.log(paymentData.amount)
    console.log(+(parseFloat(userWallet.balance).toFixed(2)) - paymentData.amount)
    if (userWallet && (+(parseFloat(userWallet.balance).toFixed(2)) - paymentData.amount) < 0) {
      return resolve({
        user: paymentData.familyAdmin,
        amount: paymentData.amount,
        status: 'Rejected',
        comments: 'User doesnot have enough amount in the wallet'
      });
    }
    const family = await familyDB.getFamilyById(paymentData.family, true)
    const accountDetails = family.accountDetails || {};
    await walletDB.updateOutstandingBalanceOnSuccessfulPayment(paymentData.wallet, paymentData.amount);
    // Notify user about payments
    const notificationData = {
      user: paymentData.familyAdmin,
      amount: parseFloat(paymentData.amount).toFixed(2)
    };
    // record payment
    const paymentHistoryData = {
      amount: paymentData.amount,
      month,
      year,
      user: paymentData.familyAdmin,
      accountDetails: {
        account_title: accountDetails.account_title,
        iban_no: accountDetails.iban_no,
        bank_name: accountDetails.bank_name,
        swift_code: accountDetails.swift_code
      }
    };
    await paymentDB.createPayment(paymentHistoryData);
    await sendNotification(notificationData, 'transfer.successful', { wallet: paymentData.wallet });
    // add transaction history
    const transactionData = {
      bank_name: accountDetails.bank_name,
      account_title: accountDetails.account_title,
      iban_no: accountDetails.iban_no,
      swift_code: accountDetails.swift_code,
      user: paymentData.familyAdmin,
      status: 'Completed',
      amount: paymentData.amount,
      dType: accountDetails.is_donating ? 'donate' : 'transfer'
    };
    const transaction = await transactionDB.createTransaction(transactionData);
    await walletTransactionDB.createWalletTransaction({
      dType: 'bank.transfer',
      description: `Payment ${moment(new Date(year, month - 1, 2)).format('MMM YYYY')}`,
      meta: {
        transactionId: transaction._id
      },
      user: paymentData.familyAdmin,
      family: paymentData.family,
      amount: paymentData.amount,
      isCredited: false
    })
    resolve({
      user: paymentData.familyAdmin,
      amount: paymentData.amount,
      status: 'Completed',
      comments: 'Payment Successful'
    });
  })
}

const getDateRange = (minDate, maxDate) => {
  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  const startDate = moment(new Date(minDate)).utc().startOf('day').toDate();
  const endDate = moment(new Date(maxDate)).utc().endOf('day').toDate();
  return { start: startDate, end: endDate };
}
// getPeriod(queryParams) {
//   let period;
//   if (queryParams.minDate && queryParams.maxDate) {
//     period = getMonthDateRange(queryParams.year, queryParams.month);
//   } else {
//     let year = queryParams.year;
//     let month = queryParams.month;
//     if (!year) {
//       year = (new Date()).getFullYear();
//     }
//     if (!month) {
//       month = (new Date()).getMonth();
//     }
//     period = getMonthDateRange(year, month + 1); // get month gives month = require(0-11, it will be compensate in the called function
//   }
//   return period;
// }
