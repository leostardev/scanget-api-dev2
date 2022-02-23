const PaymentSchema = require('./payment-schema');

module.exports.createPayment = (paymentData) => {
  const payment = new PaymentSchema(paymentData);
  return new Promise((resolve, reject) => {
    payment.save((err, createdPayment) => {
      if (err) {
        reject(err);
      }
      resolve(createdPayment);
    });
  });
}

module.exports.getAllPayments = (query) => {
  return new Promise((resolve, reject) => {
    PaymentSchema.find(query).populate('user').exec((err, allPayments) => {
      if (err) {
        reject(err);
      }
      resolve(allPayments);
    });
  });
}
module.exports.getMonthPaymentOfUser = (month, year, user) => {
  return new Promise((resolve, reject) => {
    PaymentSchema.findOne({ month, year, user }, (err, payment) => {
      if (err) {
        reject(err);
      }
      resolve(payment);
    });
  });
}

module.exports.getAllPaymentsOfUser = (user) => {
  return new Promise((resolve, reject) => {
    PaymentSchema.find({ user }).sort({ createdAt: -1 }).exec((err, payment) => {
      if (err) {
        reject(err);
      }
      resolve(payment);
    });
  });
}
