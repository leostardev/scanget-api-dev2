const FAQSchema = require('./faq-schema');

module.exports.addFAQ = (faqData) => {
  const faq = new FAQSchema(faqData);
  return new Promise((resolve, reject) => {
    faq.save((err, createdFAQ) => {
      if (err) {
        reject(err);
      }
      resolve(createdFAQ);
    });
  });
}

module.exports.updateFAQ = (updateFAQData, faqId) => {
  return new Promise((resolve, reject) => {
    FAQSchema.findOneAndUpdate({ _id: faqId }, updateFAQData, { new: true }, (err, updatedFAQ) => {
      if (err) {
        reject(err);
      }
      resolve(updatedFAQ);
    });
  });
}

module.exports.deleteFAQ = (faqId) => {
  return new Promise((resolve, reject) => {
    FAQSchema.findById(faqId, (err) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        active: false
      };
      FAQSchema.findOneAndUpdate({ _id: faqId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        resolve({});
      });
    });
  });
}

module.exports.getAllFAQs = (query) => {
  return new Promise((resolve, reject) => {
    FAQSchema.find({ ...query, active: true }).exec((err, allFAQs) => {
      if (err) {
        reject(err);
      }
      resolve(allFAQs);
    });
  });
}
