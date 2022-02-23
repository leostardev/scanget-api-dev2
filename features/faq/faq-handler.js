const Boom = require('boom');
const faqCtrl = require('./faq-controller');
const { addFAQSchema, editFAQSchema, deleteFAQSchema, askQuestionSchema, queryScannGetSupportSchema } = require('../utils/validation');
const userDB = require('../user/user-model');
const clientSchema = require("../client/client-schema"); // eslint-disable-line

module.exports.addFAQ = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addFAQSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await faqCtrl.addFAQ(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateFAQ = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { faqId } = params;
    const validationError = editFAQSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await faqCtrl.updateFAQ(body, faqId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteFAQ = async (req, res, next) => {
  try {
    const { params } = req;
    const { faqId } = params;
    const validationError = deleteFAQSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await faqCtrl.deleteFAQ(faqId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllFAQs = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const query = {};
    if (queryParams.language) {
      query.language = queryParams.language;
    }
    const data = await faqCtrl.getAllFAQs(query);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.askQuestion = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = askQuestionSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const user = await userDB.getUserByCognitoId(currentUser.cognitoId);
    const data = await faqCtrl.askQuestion(body.question, user.email, user.username, user._id, user.family._id);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.queryScannGetSupport = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = queryScannGetSupportSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const user = await userDB.getUserByCognitoId(currentUser.cognitoId);
    const data = await faqCtrl.queryScannGetSupportSchema(body, user);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
