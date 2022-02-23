const Boom = require('boom');
const { checkSignUpSchema, checkActivateAccountSchema, checkDeactivateAccountSchema, getVerificationCodeSchema, verifyPhoneCodeSchema, sendVerifyPhoneCodeSchema, verifyCodeSchema, checkRefreshTokenSchema, checkChangePasswordSchema, checkSignInSchema, checkForgotPasswordSchema, checkVerifyPinSchema } = require('../utils/validation');
const auth = require('./authentication-controller');
const responseMessages = require('../utils/messages');
const walletCtrl = require('../wallet/wallet-controller');
const inviteCtrl = require('../invite/invite-controller');
const settingsDB = require('../settings/settings-model');
const familyCtrl = require('../family/family-controller');
const userDB = require('../user/user-model');

module.exports.login = async (req, res, next) => { // eslint-disable-line 
  try {
    const { body } = req;
    const validationError = checkSignInSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.signInUser(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.createUser = async (req, res, next) => {
  let family;
  let wallet;
  const settings = await settingsDB.getSettings();
  try {
    const { body } = req;
    const validationError = checkSignUpSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const code = body.inviteCode;
    if (code) {
      const invite = await inviteCtrl.validateInviteCode(code);
      if (!invite) {
        throw Boom.notAcceptable(responseMessages.invite.INVALID_INVITE_CODE);
      }
    }
    if (body.language === '') {
      body.language = 'en';
    }

    if (body.familyCode && body.familyCode !== '') {
      family = await familyCtrl.getFamilyByFamilyCode(body.familyCode);
      if (!family || family.length === 0) {
        throw Boom.notAcceptable(responseMessages.family.INVALID_FAMILY_CODE);
      }
      wallet = await walletCtrl.getWalletByFamilyId(family[0]._id);

      if (family.length <= 0) {
        throw Boom.notFound('Invalid Family Code, Please try again');
      } else {
        family = family[0];
      }
    }
    body.role = 'user';
    const data = await auth.signUpUser(body);
    let referedBy;
    if (code && (!body.familyCode || body.familyCode === '')) {
      referedBy = await inviteCtrl.acceptInvite(data.mongoDB._id, code, true, false);
      wallet = await walletCtrl.createWallet(settings.inviteAcceptorBonus);
    } else if (code && body.familyCode && body.familyCode !== '') {
      await inviteCtrl.acceptInvite(data.mongoDB._id, code, true, false);
      wallet = await walletCtrl.addAmountToWalletOnInviteAccept(wallet._id, settings.inviteAcceptorBonus);
    } else if (!code && (!body.familyCode || body.familyCode === '')) {
      wallet = await walletCtrl.createWallet();
    }
    if (wallet && wallet._id) {
      if (!body.familyCode || body.familyCode === '') {
        const familyData = {
          name: `${body.username}'s family`,
          familyAdmin: data.mongoDB._id,
          familyMembers: [data.mongoDB._id],
          wallet: wallet._id
        };
        const createdFamily = await familyCtrl.addFamily(familyData);
        const updateData = {
          wallet: wallet._id,
          family: createdFamily._id
        };
        if (referedBy) {
          updateData.referedBy = referedBy;
        }
        const updatedMongoUser = await userDB.updateUserDetails(updateData, data.mongoDB.cognitoId);
        const updatedWallet = await walletCtrl.attachFamilyToWallet(wallet._id, createdFamily._id);
        updatedMongoUser.wallet = updatedWallet;
        data.mongoDB = updatedMongoUser;
      } else if (body.familyCode && body.familyCode !== '') {
        const familyMembers = [...family.familyMembers];
        familyMembers.push(data.mongoDB._id);
        await familyCtrl.updateFamily({ familyMembers }, family._id);
        const updatedMongoUser = await userDB.updateUserDetails({ family: family._id, wallet: wallet._id }, data.mongoDB.cognitoId);
        updatedMongoUser.wallet = wallet;
        data.mongoDB = updatedMongoUser;
      }
    }
    // await auth.postConfirmation(data.cognito);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.forgotPassword = async (req, res, next) => { // eslint-disable-line 
  try {
    const { body } = req;
    const validationError = checkForgotPasswordSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.resetPassword(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateUserAccount = async (req, res, next) => { // eslint-disable-line 
  try {
    const { body, currentUser } = req;
    const validationError = checkDeactivateAccountSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { email } = body;
    let cognitoId;
    if (currentUser.role !== 'admin' && currentUser.email !== email) {
      throw Boom.forbidden(responseMessages.AUTH.NOT_AUTHORIZED_TO_DEACTIVATE_ACCOUNT);
    }
    if (currentUser.role === 'admin') {
      cognitoId = body.cognitoId;
    } else {
      cognitoId = currentUser.cognitoId;
    }
    const data = await auth.deactivateAccount(email, cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activateUserAccount = async (req, res, next) => { // eslint-disable-line 
  try {
    const { body, currentUser } = req;
    if (currentUser.role !== 'admin') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const validationError = checkActivateAccountSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { email, cognitoId } = body;
    const data = await auth.activateAccount(email, cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.verifyPin = async (req, res, next) => { // eslint-disable-line 
  try {
    const { body } = req;
    const validationError = checkVerifyPinSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.verifyPin(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.changePassword = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = await checkChangePasswordSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    await auth.changeUserPassword(body);
    res.json({
      success: true,
      data: {
        message: responseMessages.USER.PASSWORD_CHANGED_SUCCESSFULLY
      },
      message: responseMessages.USER.PASSWORD_CHANGED_SUCCESSFULLY
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.refreshToken = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = checkRefreshTokenSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.refreshToken(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.sendVerificationCode = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = getVerificationCodeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.sendVerificationCode(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.verifyCode = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = verifyCodeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.verifyCode(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.sendVerifyPhoneCode = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = sendVerifyPhoneCodeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.sendPhoneNumberVerificationCode(body.phoneNumber);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.verifyPhoneCode = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = verifyPhoneCodeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const status = await auth.verifyPhoneCode(body);
    res.json({
      success: true,
      data: {
        verified: status
      },
    });
  } catch (e) {
    return next(e);
  }
}
