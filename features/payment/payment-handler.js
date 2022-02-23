// const Boom = require('boom');
const paymentCtrl = require('./payment-controller');

module.exports.getAllPayments = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const data = await paymentCtrl.getAllPayments(queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
