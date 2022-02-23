let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let shoppinglistHandler = require('./shoppinglist-handler');

router.route(`/`).post(verify.verifyUser, shoppinglistHandler.addShoppinglist);

router.route(`/:shoppinglistId`).put(verify.verifyUser, shoppinglistHandler.updateShoppinglist);

router.route(`/:shoppinglistId`).delete(verify.verifyUser, shoppinglistHandler.deleteShoppinglist);

router.route(``).put(verify.verifyUser, shoppinglistHandler.getAllShoppinglists);

module.exports = router;
