let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let productHandler = require('./product-handler');

router.route(`/`).post(verify.verifyAdmin, productHandler.addProduct);

router.route(`/:productId`).put(verify.verifyAdmin, productHandler.updateProduct);

router.route(`/:productId`).delete(verify.verifyAdmin, productHandler.deleteProduct);

router.route(``).get(verify.verifyUser, productHandler.getAllProducts);

router.route(`/:productId`).get(verify.verifyUser, productHandler.getProductById);

router.route(`/category/:categoryId`).get(verify.verifyUser, productHandler.getProductsByCategory);

router.route(`/csv/get`).get(verify.verifyAdmin, productHandler.exportProductsToCsv);

module.exports = router;
