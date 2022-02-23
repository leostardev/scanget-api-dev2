let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let walletHandler = require('./wallet-handler');

router.route(`/user/:user`).get(verify.verifyUser, walletHandler.getWalletByUserId);

router.route(`/:walletId`).put(verify.verifyUser, walletHandler.updateAmountToWallet);

module.exports = router;
