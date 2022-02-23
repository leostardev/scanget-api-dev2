const RetailerSchema = require('./retailer-schema');

module.exports.addRetailer = retailerData => {
  const retailer = new RetailerSchema(retailerData);
  return new Promise((resolve, reject) => {
    retailer.save((err, createdRetailer) => {
      if (err) {
        reject(err);
      }
      resolve(createdRetailer);
    });
  });
}

module.exports.updateRetailer = (updateRetailerData, retailerId) => {
  return new Promise((resolve, reject) => {
    RetailerSchema.findOneAndUpdate({ _id: retailerId }, updateRetailerData, { new: true }, (err, updatedRetailer) => {
      if (err) {
        reject(err);
      }
      resolve(updatedRetailer);
    });
  });
}

module.exports.deleteRetailer = retailerId => {
  return new Promise((resolve, reject) => {
    RetailerSchema.findById(retailerId, (err, retailer) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        name: `${retailer.name}-deleted`,
        active: false
      };
      RetailerSchema.findOneAndUpdate({ _id: retailerId }, updateData, { new: true }, err2 => {
        if (err2) {
          reject(err2);
        }
        resolve({});
      });
    });
  });
}

module.exports.getAllRetailers = () => {
  return new Promise((resolve, reject) => {
    RetailerSchema.find({ active: true }).populate('category').exec((err, allRetailers) => {
      if (err) {
        reject(err);
      }
      resolve(allRetailers);
    });
  });
}

module.exports.getRetailerById = retailerId => {
  return new Promise((resolve, reject) => {
    RetailerSchema.findById(retailerId, (err, retailer) => {
      if (err) {
        reject(err);
      }
      resolve(retailer);
    });
  });
}
