let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let favoriteHandler = require('./favorite-handler');

router.route(`/`).post(verify.verifyUser, favoriteHandler.addToFavorite);

router.route(`/remove`).put(verify.verifyUser, favoriteHandler.removeFromFavorite);

module.exports = router;
