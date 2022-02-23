// NPM Package Requires
let express = require('express');
const mongoose = require('mongoose');
const config = require('@config');
const serverMessages = require('@common/messages');

// User Package Requires
const auth = require('../features/authentication/authentication.route');
const brand = require('../features/brand/brand.route')
const category = require('../features/category/category.route')
const client = require('../features/client/client.route')
const clientPackage = require('../features/client-package/client-package.route')
const community = require('../features//community/community.route')
const communityEvent = require('../features/community-event/community-event.route')
const communityHistory = require('../features/community-history/community-history.route')
const communityIntroduction = require('../features/community-introduction/community-introduction.route')
const communityPeople = require('../features/community-people/community-people.route')
const communityPoints = require('../features/community-points/community-points.route')
const communityProduct = require('../features/community-product/community-product.route')
const communityRecipe = require('../features/community-recipe/community-recipe.route')
const communityValue = require('../features/community-value/community-value.route')
const dashboard = require('../features/dashboard/dashboard.route')
const deal = require('../features/deal/deal.route')
const donation = require('../features/donation/donation.route')
const family = require('../features/family/family.route')
const faq = require('../features/faq/faq.route')
const favorite = require('../features/favorite/favorite.route')
const invite = require('../features/invite/invite.route')
const location = require('../features/location/location.route')
const notification = require('../features/notification/notification.route')
const packageRoutes = require('../features/package/package.route')
const payment = require('../features/payment/payment.route')
const period = require('../features/period/period.route')
const product = require('../features/product/product.route')
const promotion = require('../features/promotion/promotion.route')
const receipt = require('../features/receipt/receipt.route')
const retailer = require('../features/retailer/retailer.route')
const sector = require('../features/sector/sector.route')
const settings = require('../features/settings/settings.route')
const shoppinglist = require('../features/shoppinglist/shoppinglist.route')
const transaction = require('../features/transaction/transaction.route')
const user = require('../features/user/user.route');
const wallet = require('../features/wallet/wallet.route')
const flashPromo = require('../features/flash-promo/flash-promo.route')
const walletTransactions = require('../features/wallet-transaction/wallet-transaction.route');

module.exports = function (app) {

  let router = express.Router();

  router.use(`/auth`, auth);
  router.use(`/brand`, brand);
  router.use(`/category`, category);
  router.use(`/client`, client);
  router.use(`/client-package`, clientPackage);
  router.use(`/community`, community);
  router.use(`/community-event`, communityEvent);
  router.use(`/community-history`, communityHistory);
  router.use(`/community-introduction`, communityIntroduction);
  router.use(`/community-people`, communityPeople);
  router.use(`/community-points`, communityPoints);
  router.use(`/community-product`, communityProduct);
  router.use(`/community-recipe`, communityRecipe);
  router.use(`/community-value`, communityValue);
  router.use(`/dashboard`, dashboard);
  router.use(`/donation`, donation);
  router.use(`/deal`, deal);
  router.use(`/family`, family);
  router.use(`/faq`, faq);
  router.use(`/favorite`, favorite);
  router.use(`/invite`, invite);
  router.use(`/location`, location);
  router.use(`/notification`, notification);
  router.use(`/package`, packageRoutes);
  router.use(`/payment`, payment);
  router.use(`/period`, period);
  router.use(`/product`, product);
  router.use(`/promotion`, promotion);
  router.use(`/receipt`, receipt);
  router.use(`/retailer`, retailer);
  router.use(`/sector`, sector);
  router.use(`/setting`, settings);
  router.use(`/shoppinglist`, shoppinglist);
  router.use(`/transaction`, transaction);
  router.use(`/user`, user);
  router.use(`/wallet`, wallet);
  router.use(`/flash-promo`, flashPromo);
  router.use(`/wallet-transaction`, walletTransactions);

  router.get(`/`, function (req, res) {
    // TOD Ping DB
    res.json({
      message: 'Health Check Complete',
      data: {
        env: process.env.NODE_ENV,
        version: config.apiVersion
      },
      success: true
    });
  });

  app.use(`/api`, (req, res, next) => {
    if (mongoose.connection.readyState !== 0) {
      req.queryParams = req.query;
      next();
    } else {
      return next({
        message: serverMessages.generic.ERROR_CONNECTION,
        data: null
      });
    }
  }, router);
};
