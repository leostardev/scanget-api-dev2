const Boom = require('boom');
const paymentDB = require('./payment-model');

module.exports.getAllPayments = async (queryParams) => {
  try {
    const query = {};
    if (queryParams.month && queryParams.year) {
      query.month = queryParams.month;
      query.year = queryParams.year;
    }
    if (queryParams.user) {
      query.user = queryParams.user;
    }
    const allPayments = await paymentDB.getAllPayments(query);
    return allPayments;
  } catch (error) {
    throw Boom.forbidden('Something went wrong while getting payments', error);
  }
}
