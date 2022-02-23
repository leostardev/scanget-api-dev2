const ClientPackageSchema = require('./client-package-schema');
const ClientSchema = require('../client/client-schema'); // eslint-disable-line
const PackageSchema = require('../package/package-schema'); // eslint-disable-line

module.exports.requestClientPackage = (packageData) => {
  const clientPackage = new ClientPackageSchema(packageData);
  return new Promise((resolve, reject) => {
    clientPackage.save((err, createdPackage) => {
      if (err) {
        reject(err);
      }
      ClientPackageSchema.populate(createdPackage, { path: 'client package' }, (err2, populatedData) => {
        if (err2) {
          reject(err2);
        }
        resolve(populatedData);
      });
    });
  });
}

module.exports.updateClientPackage = (clientPackageId, updateData) => {
  return new Promise((resolve, reject) => {
    ClientPackageSchema.findByIdAndUpdate(clientPackageId, updateData, { new: true }).populate('client package').exec((err, updateClientPackage) => {
      if (err) {
        reject(err);
      }
      resolve(updateClientPackage);
    });
  });
}

module.exports.getAllClientPackages = (query) => {
  return new Promise((resolve, reject) => {
    ClientPackageSchema.find(query).populate('client package').exec((err, packages) => {
      if (err) {
        reject(err);
      }
      resolve(packages);
    });
  });
}

module.exports.getClientPackageById = (clientPackageId) => {
  return new Promise((resolve, reject) => {
    ClientPackageSchema.findById(clientPackageId, (err, clientPackage) => {
      if (err) {
        reject(err);
      }
      resolve(clientPackage);
    });
  });
}

module.exports.decreaseSlots = (clientPackageId, numberOfPeriods) => {
  const decreaseCount = numberOfPeriods || 1;
  return new Promise((resolve, reject) => {
    ClientPackageSchema.findByIdAndUpdate(clientPackageId, { $inc: { slots: -decreaseCount } }, { new: true }, (err, updateClientPackage) => {
      if (err) {
        reject(err);
      }
      resolve(updateClientPackage);
    });
  });
}

module.exports.decreaseBanners = (clientPackageId, numberOfPeriods) => {
  const decreaseCount = numberOfPeriods || 1;
  return new Promise((resolve, reject) => {
    ClientPackageSchema.findByIdAndUpdate(clientPackageId, { $inc: { banners: -decreaseCount } }, { new: true }, (err, updateClientPackage) => {
      if (err) {
        reject(err);
      }
      resolve(updateClientPackage);
    });
  });
}
