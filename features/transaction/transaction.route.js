let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let transactionHandler = require('./transaction-handler');

router.route(`/transfer`).post(verify.verifyUser, transactionHandler.createTransferTransaction);

router.route(`/:transactionId`).delete(verify.verifyUser, transactionHandler.deleteTransaction);

router.route(`/all`).post(verify.verifyUser, transactionHandler.getAllTransactions);

router.route(`/all/csv`).post(verify.verifyUser, transactionHandler.getAllTransactionsCSV);

router.route(`/:transactionId/approve`).put(verify.verifyAdmin, transactionHandler.approveTransaction);

router.route(`/recharge`).post(verify.verifyUser, transactionHandler.createRechargeTransaction);

router.route(`/payment`).post(verify.verifyAdmin, transactionHandler.notifySuccessfulPayment);

router.route(`/payment/csv`).post(verify.verifyAdmin, transactionHandler.notifySuccessfulPaymentFromCSV);

module.exports = router;
