const Boom = require('boom');
const config = require('../../config');
const transactionCtrl = require('./transaction-controller');
const { createTransferTransactionSchema, approveTransactionSchema, deleteTransactionSchema, getAllTransactionSchema, createRechargeTransactionSchema, notifySuccessfulPaymentArraySchema, notifySuccessfulPaymentSchema, notifySuccessfulPaymentFromCSVSchema } = require('../utils/validation');
const authCtrl = require('../authentication/authentication-controller');
const responseMessages = require('../utils/messages');
const { sendNotification } = require('../utils/notification/notification');

module.exports.createTransferTransaction = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = createTransferTransactionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const transactionData = { ...body };
    transactionData.dType = 'transfer';
    const data = await transactionCtrl.createTransaction(transactionData);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.approveTransaction = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { transactionId } = params;
    const validationError = approveTransactionSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await transactionCtrl.approveTransaction(body, transactionId);
    const notificationContent = {
      dType: data.dType,
      amount: parseFloat(data.amount).toFixed(2),
      user: data.user._id
    };
    await sendNotification(notificationContent, 'transaction.complete', { transactionId });
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteTransaction = async (req, res, next) => {
  try {
    const { params } = req;
    const { transactionId } = params;
    const validationError = deleteTransactionSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await transactionCtrl.deleteTransaction(transactionId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllTransactions = async (req, res, next) => {
  try {
    const { body, queryParams, currentUser } = req;
    const validationError = getAllTransactionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (!body.user && currentUser.role !== 'admin') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }

    const data = await transactionCtrl.getAllTransactions(body, queryParams, currentUser.role === 'admin');
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllTransactionsCSV = async (req, res, next) => {
  try {
    const { body, queryParams, currentUser } = req;
    const validationError = getAllTransactionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (currentUser.role !== 'admin') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }

    const allTransactionsCSV = await transactionCtrl.getAllTransactionsCSV(body, queryParams, true);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${allTransactionsCSV.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.createRechargeTransaction = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = createRechargeTransactionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { code, accessToken } = body;
    const params = { code, accessToken };
    try {
      await authCtrl.verifyCode(params);
    } catch (error) {
      throw Boom.forbidden(responseMessages.transaction.INVALID_CODE_PROVIDED, error);
    }
    const { amount, phoneNo, user } = body;
    const rechargeData = {
      amount,
      phoneNo,
      user,
      dType: 'recharge'
    };
    const data = await transactionCtrl.createTransaction(rechargeData);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.notifySuccessfulPayment = async (req, res, next) => {
  try {
    const { body } = req;
    let validationError = notifySuccessfulPaymentSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const paymentInfo = body.payment;
    const { month, year } = body;
    for (let i = 0; i < paymentInfo.length; i++) {
      validationError = notifySuccessfulPaymentArraySchema(paymentInfo[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }

    const data = await transactionCtrl.notifySuccessfulPayment(paymentInfo, month, year);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.notifySuccessfulPaymentFromCSV = async (req, res, next) => {
  try {
    const { body } = req;
    let validationError = notifySuccessfulPaymentSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const paymentInfo = body.payment;
    const { month, year } = body;
    for (let i = 0; i < paymentInfo.length; i++) {
      validationError = notifySuccessfulPaymentFromCSVSchema(paymentInfo[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }

    const data = await transactionCtrl.notifySuccessfulPaymentFromCSV(paymentInfo, month, year);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
