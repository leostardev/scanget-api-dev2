let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let authHandler = require('./authentication-handler');

router.route(`/signup`).post(authHandler.createUser);

router.route(`/signin`).post(authHandler.login);

router.route(`/forgot-password`).post(authHandler.forgotPassword);

router.route(`/verify-pin`).post(authHandler.verifyPin);

router.route(`/change-password`).post(verify.verifyUser, authHandler.changePassword);

router.route(`/refresh`).put(authHandler.refreshToken);

router.route(`/verification/get`).post(verify.verifyUser, authHandler.sendVerificationCode);

router.route(`/verification/verify`).post(verify.verifyUser, authHandler.verifyCode);

router.route(`/deactivate`).post(verify.verifyUser, authHandler.deactivateUserAccount);

router.route(`/activate`).post(verify.verifyUser, authHandler.activateUserAccount);

router.route(`/send-verify-phone`).post(authHandler.sendVerifyPhoneCode);

router.route(`/verify-phone`).post(authHandler.verifyPhoneCode);

module.exports = router;
