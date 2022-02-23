let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let categoryHandler = require('./category-handler');

router.route(`/`).post(verify.verifyAdmin, categoryHandler.addCategory);

router.route(`/:categoryId`).put(verify.verifyAdmin, categoryHandler.updateCategory);

router.route(`/:categoryId`).delete(verify.verifyAdmin, categoryHandler.deleteCategory);

router.route(``).get(verify.verifyUser, categoryHandler.getAllCategories);

router.route(`/mine`).post(verify.verifyUser, categoryHandler.addToMyCategories);

router.route(`/mine/remove`).put(verify.verifyUser, categoryHandler.removeFromMyCategories);

module.exports = router;
