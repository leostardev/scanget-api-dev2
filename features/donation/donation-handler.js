const Boom = require('boom');
const donationCtrl = require('./donation-controller');
const { addDonationItemsSchema, updateDonationSchema, deleteDonationSchema } = require('../utils/validation');

module.exports.addDonation = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = addDonationItemsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await donationCtrl.addDonation(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateDonation = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { donationId } = params;
    const validationError = updateDonationSchema({ ...body, donationId });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await donationCtrl.updateDonation(body, donationId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteDonation = async (req, res, next) => {
  try {
    const { params } = req;
    const { donationId } = params;
    const validationError = deleteDonationSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await donationCtrl.deleteDonation(donationId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllDonations = async (req, res, next) => {
  try {
    let isAdmin = false;
    const { currentUser } = req;
    if (currentUser.role === 'admin') {
      isAdmin = true;
    }
    const data = await donationCtrl.getAllDonations(isAdmin);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateDonation = async (req, res, next) => {
  try {
    const { params } = req;
    const { donationId } = params;
    const data = await donationCtrl.deactivateDonation(donationId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
