const BrandSchema = require('./brand-schema');

module.exports.addBrand = (brandData) => {
  const brand = new BrandSchema(brandData);
  return new Promise((resolve, reject) => {
    brand.save((err, createdBrand) => {
      if (err) {
        reject(err);
      }
      resolve(createdBrand);
    });
  });
}

module.exports.updateBrand = (updateBrandData, brandId) => {
  return new Promise((resolve, reject) => {
    BrandSchema.findOneAndUpdate({ _id: brandId }, updateBrandData, { new: true }, (err, updatedBrand) => {
      if (err) {
        reject(err);
      }
      resolve(updatedBrand);
    });
  });
}

module.exports.deleteBrand = (brandId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    BrandSchema.findByIdAndUpdate(brandId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllBrands = () => {
  return new Promise((resolve, reject) => {
    BrandSchema.find({ active: true }).sort({ position: 1 }).exec((err, allBrands) => {
      if (err) {
        reject(err);
      }
      resolve(allBrands);
    });
  });
}

module.exports.getBrandByPosition = (position) => {
  return new Promise((resolve, reject) => {
    BrandSchema.findOne({ position, active: true }, (err, brand) => {
      if (err) {
        reject(err);
      }
      resolve(brand);
    });
  });
}
