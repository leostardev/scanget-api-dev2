const PackageSchema = require('./package-schema');

module.exports.createPackage = (packageData) => {
  return new Promise((resolve, reject) => {
    PackageSchema.create(packageData, (err, newPackage) => {
      if (err) {
        reject(err);
      }
      resolve(newPackage);
    });
  });
}

module.exports.updatePackageData = (packageId, updateData) => {
  return new Promise((resolve, reject) => {
    PackageSchema.findByIdAndUpdate(packageId, updateData, { new: true }, (err, updatePackage) => {
      if (err) {
        reject(err);
      }
      resolve(updatePackage);
    });
  });
}

module.exports.updatePackageById = (packageId, updateData) => {
  return new Promise((resolve, reject) => {
    PackageSchema.findByIdAndUpdate(packageId, updateData, (err, updatePackage) => {
      if (err) {
        reject(err);
      }
      resolve(updatePackage);
    });
  });
}

module.exports.getAllPackages = (query) => {
  return new Promise((resolve, reject) => {
    PackageSchema.find(query, (err, packages) => {
      if (err) {
        reject(err);
      }
      resolve(packages);
    });
  });
}
module.exports.getPackageById = (packageId) => {
  return new Promise((resolve, reject) => {
    PackageSchema.findById(packageId, (err, packageData) => {
      if (err) {
        reject(err);
      }
      resolve(packageData);
    });
  });
}
