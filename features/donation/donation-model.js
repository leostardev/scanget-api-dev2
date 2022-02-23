const DonationSchema = require('./donation-schema');

module.exports.addDonation = (donationData) => {
  const donation = new DonationSchema(donationData);
  return new Promise((resolve, reject) => {
    donation.save((err, createdDonation) => {
      if (err) {
        reject(err);
      }
      resolve(createdDonation);
    });
  });
}

module.exports.updateDonation = (updateDonationData, donationId) => {
  return new Promise((resolve, reject) => {
    DonationSchema.findByIdAndUpdate(donationId, updateDonationData, { new: true }, (err, updatedDonation) => {
      if (err) {
        reject(err);
      }
      resolve(updatedDonation);
    });
  });
}

module.exports.deleteDonation = (donationId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    DonationSchema.findByIdAndUpdate(donationId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllDonations = (isAdmin) => {
  const query = {
    active: true
  };
  if (!isAdmin) {
    query.deactivated = false;
  }
  return new Promise((resolve, reject) => {
    DonationSchema.find({ active: true }).exec((err, allDonations) => {
      if (err) {
        reject(err);
      }
      resolve(allDonations);
    });
  });
}

module.exports.getDonationByPosition = (position) => {
  return new Promise((resolve, reject) => {
    DonationSchema.findOne({ position, active: true }, (err, donation) => {
      if (err) {
        reject(err);
      }
      resolve(donation);
    });
  });
}
