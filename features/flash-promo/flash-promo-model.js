const FlashPromoSchema = require('./flash-promo-schema');
const randomNumber = require('random-number-arrays');

module.exports.addFlashPromo = (flashPromoData) => {
  const flashPromo = new FlashPromoSchema(flashPromoData);
  return new Promise((resolve, reject) => {
    flashPromo.save((err, createdFlashPromo) => {
      if (err) {
        reject(err);
      }
      resolve(createdFlashPromo);
    });
  });
}

module.exports.updateFlashPromo = (updateFlashPromoData, flashPromoId) => {
  return new Promise((resolve, reject) => {
    FlashPromoSchema.findOneAndUpdate({ _id: flashPromoId }, updateFlashPromoData, { new: true }, (err, updatedFlashPromo) => {
      if (err) {
        reject(err);
      }
      resolve(updatedFlashPromo);
    });
  });
}

module.exports.deleteFlashPromo = (flashPromoId) => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    FlashPromoSchema.findByIdAndUpdate(flashPromoId, updateData, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllFlashPromos = () => {
  return new Promise((resolve, reject) => {
    FlashPromoSchema.find({ active: true }).exec((err, allFlashPromos) => {
      if (err) {
        reject(err);
      }
      resolve(allFlashPromos);
    });
  });
}

module.exports.getFlashPromoById = (flashPromoId) => {
  return new Promise((resolve, reject) => {
    FlashPromoSchema.findById(flashPromoId, (err, flashPromo) => {
      if (err) {
        reject(err);
      }
      resolve(flashPromo);
    });
  });
}

module.exports.getTodayFlashPromo = (query) => {
  return new Promise((resolve, reject) => {
    FlashPromoSchema.find(query).exec((err, allFlashPromos) => {
      if (err) {
        reject(err);
      }
      if (allFlashPromos && allFlashPromos.length > 0) {
        const selectedPromo = randomNumber({
          data: allFlashPromos,
          type: 'array',
          arraySize: 1,
          unique: true,
        })[0];
        console.log(selectedPromo);
        resolve(selectedPromo);
      } else {
        resolve(null)
      }
    });
  })
};

