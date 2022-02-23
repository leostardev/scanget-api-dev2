const Boom = require('boom');
const donationDB = require('./donation-model');
const responseMessages = require('../utils/messages');

module.exports.addDonation = async (donation) => {
  try {
    const createdDonation = await donationDB.addDonation(donation);
    return createdDonation;
  } catch (error) {
    throw Boom.forbidden(responseMessages.donation.ERROR_ADDING_DONATION, error);
  }
}

module.exports.updateDonation = async (updateData, donationId) => {
  try {
    const updatedDonation = await donationDB.updateDonation(updateData, donationId);
    return updatedDonation;
  } catch (error) {
    throw Boom.forbidden(responseMessages.donation.ERROR_UPDATING_DONATION, error);
  }
}

module.exports.deleteDonation = async (donationId) => {
  try {
    await donationDB.deleteDonation(donationId);
    return {
      message: responseMessages.donation.SUCCESS_DELETE_DONATION
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.donation.ERROR_DELETING_DONATION, error);
  }
}

module.exports.getAllDonations = async (isAdmin) => {
  try {
    const allDonations = await donationDB.getAllDonations(isAdmin);
    return allDonations;
  } catch (error) {
    throw Boom.forbidden(responseMessages.donation.ERROR_GETTING_ALL_DONATIONS, error);
  }
}

module.exports.deactivateDonation = async (donationId) => {
  try {
    const updateData = {
      deactivated: true
    };
    const updatedDonation = await donationDB.updateDonation(updateData, donationId);
    return updatedDonation;
  } catch (error) {
    throw Boom.forbidden(responseMessages.donation.ERROR_DEACTIVATING_DONATION, error);
  }
}
