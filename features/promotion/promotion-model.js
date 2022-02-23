// const moment = require('moment');
const PromotionSchema = require('./promotion-schema');
// eslint-disable-next-line no-unused-vars
const dealSchema = require('../deal/deal-schema');

module.exports.addPromotion = (promotionData) => {
  const promotion = new PromotionSchema(promotionData);
  return new Promise((resolve, reject) => {
    promotion.save((err, createdPromotion) => {
      if (err) {
        reject(err);
      }
      PromotionSchema.findById(createdPromotion._id).deepPopulate('deal.periods client periods clientPackage periods').lean().exec((err2, populatedData) => {
        if (err2) {
          reject(err2);
        }
        resolve(populatedData);
      });
    });
  });
}

module.exports.updatePromotion = (updatePromotionData, promotionId) => {
  return new Promise((resolve, reject) => {
    PromotionSchema.findOneAndUpdate({ _id: promotionId }, updatePromotionData, { new: true }).deepPopulate('deal.periods client periods clientPackage periods').lean().exec((err, updatedPromotion) => {
      if (err) {
        reject(err);
      }

      resolve(updatedPromotion);
    });
  });
}

module.exports.deletePromotion = (promotionId) => {
  return new Promise((resolve, reject) => {
    PromotionSchema.findById(promotionId, (err, promotion) => { // eslint-disable-line
      if (err) {
        reject(err);
      }
      const updateData = {
        active: false
      };
      PromotionSchema.findOneAndUpdate({ _id: promotionId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        resolve({});
      });
    });
  });
}

module.exports.getAllPromotions = () => {
  const todayDate = new Date();
  return new Promise((resolve, reject) => {
    PromotionSchema.aggregate([
      {
        $match: {
          active: true,
          // startDate: {
          //   $lte: moment(new Date(todayDate)).startOf('day').toDate()
          // },
          // endDate: {
          //   $gte: moment(new Date(todayDate)).endOf('day').toDate()
          // }
        },
      },
      // {
      //   $lookup: {
      //     from: 'deals', localField: 'deal', foreignField: '_id', as: 'deal'
      //   }
      // },
      // {
      //   $unwind: '$deal'
      // },
      // {
      //   $match: {
      //     'deal.endDate': {
      //       $gte: moment(new Date(todayDate)).startOf('day').toDate()
      //     },
      //     'deal.startDate': {
      //       $lte: moment(new Date(todayDate)).startOf('day').toDate()
      //     }
      //   }
      // }
    ]).exec((err2, promotions) => {
      if (err2) {
        reject(err2);
      }
      const filteredPromotion = [];
      filteredPromotion.map((promotion) => {
        for (let i = 0; i < promotion.periods.length; i++) {
          if (promotion.periods[i].startDate <= todayDate && promotion.periods[i].endDate >= todayDate) {
            filteredPromotion.push(promotion);
            // break;
          }
        }
        return {};
      });
      resolve(promotions);
    });
  });
}

module.exports.getAllPromotionsForAdmin = () => {
  const query = {
    active: true
  };
  return new Promise((resolve, reject) => {
    PromotionSchema.find(query).deepPopulate('deal.periods client periods clientPackage periods').lean().exec((err, updatedPromotion) => {
      if (err) {
        reject(err);
      }
      resolve(updatedPromotion);
    });
  });
}

module.exports.getAllPromotionsForClient = (queryParams) => {
  const query = {
    active: true,
    client: queryParams.client
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.startDate = {
      $gte: queryParams.minDate,
      $lte: queryParams.maxDate
    };
  }
  return new Promise((resolve, reject) => {
    PromotionSchema.find(query).deepPopulate('deal.periods client periods clientPackage periods').lean().exec((err, updatedPromotion) => {
      if (err) {
        reject(err);
      }
      resolve(updatedPromotion);
    });
  });
}

module.exports.getPromotionById = (id) => {
  return new Promise((resolve, reject) => {
    PromotionSchema.findById(id, (err, promotion) => {
      if (err) {
        reject(err);
      }
      resolve(promotion);
    });
  });
}
