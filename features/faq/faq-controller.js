const Boom = require('boom');
const faqDB = require('./faq-model');
const responseMessages = require('../utils/messages');
const { sendEmail } = require('../utils/email');

module.exports.addFAQ = async faq => {
  try {
    const createdFAQ = await faqDB.addFAQ(faq);
    return createdFAQ;
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_ADDING_FAQ, error);
  }
};

module.exports.updateFAQ = async (updateData, faqId) => {
  try {
    const updatedFAQ = await faqDB.updateFAQ(updateData, faqId);
    return updatedFAQ;
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_UPDATING_FAQ, error);
  }
};

module.exports.deleteFAQ = async faqId => {
  try {
    await faqDB.deleteFAQ(faqId);
    return {
      message: responseMessages.faq.SUCCESS_DELETE_FAQ
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_DELETING_FAQ, error);
  }
};

module.exports.getAllFAQs = async query => {
  try {
    const allFAQs = await faqDB.getAllFAQs(query);
    return allFAQs;
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_GETTING_ALL_FAQS, error);
  }
};
module.exports.askQuestion = async (question, email, name, mongoId, familyId) => {
  try {
    const params = {
      subject: 'Question = require(ScanNGet User',
      text: `Hi, I am a ScanNGet user, I want to ask the following question:\n${question}\nThanks.\nRegards\nUsername: ${name}\nEmail: ${email}\nMongoId: ${mongoId}\nFamilyId: ${familyId}`,
      email
    };
    await sendEmail(params);
    return;
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_GETTING_ALL_FAQS, error);
  }
};

module.exports.queryScannGetSupportSchema = async (data, user) => {
  try {
    const params = {
      subject: `Contact Us request = require(${user.email}`,
      text: `Name: ${data.name}\nSubject: ${data.subject}\nComment: ${data.comment}\n\nUser Datails:\nUsername: ${user.username}\nEmail: ${user.email}\nMongoId: ${user._id}\nFamilyId: ${user.family._id}`,
      email: user.email
    };
    await sendEmail(params);
    return;
  } catch (error) {
    throw Boom.forbidden(responseMessages.faq.ERROR_CONTACTING_SCANNGET_SUPPORT, error);
  }
};
