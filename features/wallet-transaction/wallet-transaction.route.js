let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let walletTransactionHandler = require('./wallet-transaction-handler');

router.route(`/all`).post(verify.verifyUser, walletTransactionHandler.getAllWalletTransactions);

router.route(`/sync`).post(verify.verifyAdmin, walletTransactionHandler.syncWalletTransactions);

router.route(`/:userId/all`).post(verify.verifyUser, walletTransactionHandler.getUserAllWalletTransactions);

router.route(`/:userId/summary`).post(verify.verifyAdmin, walletTransactionHandler.getUserWalletTransactionsSummary);

module.exports = router;
