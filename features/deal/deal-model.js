const moment = require('moment');
const mongoose = require('mongoose');
const DealSchema = require('./deal-schema');
const ProductSchema = require('../product/product-schema');
const categorySchema = require('../category/category-schema');
const RetailerSchema = require('../retailer/retailer-schema');
const PromotionSchema = require('../promotion/promotion-schema');
const PeriodSchema = require('../period/period-schema');
const clientSchema = require('../client/client-schema');

module.exports.addDeal = (dealData) => {
  const deal = new DealSchema(dealData);
  return new Promise((resolve, reject) => {
    deal.save((err, createdDeal) => {
      if (err) {
        reject(err);
      }
      DealSchema.populate(createdDeal, { path: 'product category otherSavings.retailer periods client' }, (err2, populatedData) => {
        if (err2) {
          reject(err2);
        }
        resolve(populatedData);
      });
    });
  });
}

module.exports.editDeal = (dealData, dealId) => {
  return new Promise((resolve, reject) => {
    DealSchema.findByIdAndUpdate(dealId, dealData, { new: true }).populate('product category periods client').lean().exec((err, updatedDeal) => {
      if (err) {
        reject(err);
      }
      resolve(updatedDeal);
    });
  });
}

module.exports.deleteDeal = (dealId) => {
  return new Promise((resolve, reject) => {
    DealSchema.findById(dealId, (err, deal) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        title: `${deal.title}-deleted`,
        active: false
      };
      DealSchema.findOneAndUpdate({ _id: dealId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }

        PromotionSchema.update({ deal: dealId }, { active: false }, { multi: true }, (err3) => { // eslint-disable-line
          return reject(err3);
        });
        resolve({});
      });
    });
  });
}

module.exports.getDealById = (dealId) => {
  return new Promise((resolve, reject) => {
    DealSchema.findById(dealId).populate({ path: 'category', model: categorySchema }).populate({ path: 'product', model: ProductSchema }).populate({ path: 'otherSavings.retailer', model: RetailerSchema }).populate({ path: 'periods', model: PeriodSchema }).populate({ path: 'client', model: clientSchema }).lean().exec((err, allDeals) => {
      if (err) {
        reject(err);
      }
      resolve(allDeals);
    });
  });
}

module.exports.getDealByIdForValidation = (dealId) => {
  return new Promise((resolve, reject) => {
    DealSchema.findById(dealId, (err, deal) => {
      if (err) {
        reject(err);
      } else {
        resolve(deal);
      }
    });
  });
}

module.exports.getAllDeals = (category) => {
  const todayDate = moment(new Date()).utc().startOf('day').toDate();
  const query = {
    // endDate: {
    //   $gte: moment(todayDate).startOf('day')
    // },
    // startDate: {
    //   $lte: moment(todayDate).startOf('day')
    // },
    active: true,
    approved: true,
    deactivated: false,
    rejected: false
  };
  if (category && category.length > 0) {
    query.category = { $in: category };
  }
  return new Promise((resolve, reject) => {
    DealSchema.find(
      query
    )
      .populate({ path: 'category', model: categorySchema })
      .populate({ path: 'product', model: ProductSchema })
      .populate({ path: 'otherSavings.retailer', model: RetailerSchema })
      .populate({ path: 'periods', model: PeriodSchema })
      .populate({ path: 'client', model: clientSchema }).lean().sort({ weight: -1 }).exec((err, allDeals) => {
        if (err) {
          reject(err);
        }
        // allDeals = allDeals.sort((a, b) => {
        //   if (a.title < b.title) { return -1; }
        //   if (a.title > b.title) { return 1; }
        //   return 0;
        // });
        const filteredDeals = [];
        allDeals.map((deal) => {
          for (let i = 0; i < deal.periods.length; i++) {
            if (deal.periods[i].startDate <= todayDate && deal.periods[i].endDate >= todayDate) {
              const dealData = { ...deal };
              dealData.description = `For each ${dealData.title} purchased between ${moment(dealData.periods[i].startDate).format('DD-MM-YYYY')} until ${moment(dealData.periods[i].endDate).format('DD-MM-YYYY')}, get ${dealData.savingType === 'percent' ? `${dealData.savedPercent} %` : `€ ${dealData.savingAmount}`} back.`;
              filteredDeals.push(dealData);
              // break;
            }
          }
          return {};
        });
        resolve(filteredDeals);
      });
  });
}

module.exports.getCurrentMaximumWeight = () => {
  const query = {
    active: true
  };

  return new Promise((resolve, reject) => {
    DealSchema.find(query).sort({ weight: -1 }).limit(1).exec((err, maxWeightDeal) => {
      if (err) {
        reject(err);
      }
      if (maxWeightDeal && maxWeightDeal.length > 0) {
        return resolve(maxWeightDeal[0].weight || 0);
      }
      return resolve(0);
    });
  });
}

module.exports.getAllDealsForAdmin = (queryParams) => {
  const searchText = queryParams.search;
  let filterTextQuery = {};
  const limit = parseInt(queryParams.limit || 50);
  const skip = parseInt((queryParams.skip || 0) * 50);
  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'title': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'product.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'category.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'client.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'periods.description': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    }
  }
  const query = {
    active: true
  };
  if (queryParams.dealId) {
    query._id = mongoose.Types.ObjectId(queryParams.dealId)
  }
  if (queryParams.dType) {
    query.dType = queryParams.dType
  }

  if (queryParams.client) {
    query.client = mongoose.Types.ObjectId(queryParams.client)
  }

  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day'),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day')
    };
  }

  return new Promise((resolve, reject) => {
    DealSchema.aggregate([{
      $match: query
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $lookup:
      {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $lookup: {
        from: 'retailers',
        localField: 'otherSavings.retailer',
        foreignField: '_id',
        as: 'retailer'
      }
    },
    // {
    //   $unwind: {
    //     path: '$retailer',
    //     preserveNullAndEmptyArrays: true
    //   },
    // },
    {
      $lookup:
      {
        from: 'periods',
        localField: 'periods',
        foreignField: '_id',
        as: 'periods'
      }
    },
    {
      $lookup:
      {
        from: 'clients',
        localField: 'client',
        foreignField: '_id',
        as: 'client'
      }
    },
    {
      $unwind: '$client'
    },
    {
      $match: filterTextQuery
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $project: {
        '_id': 1,
        'client.name': 1,
        'client._id': 1,
        'title': 1,
        'weight': 1,
        'active': 1,
        'approved': 1,
        'image': 1,
        'deactivated': 1,
        'category.name': 1,
        'category._id': 1,
        'product._id': 1,
        'product.name': 1,
        'savingAmount': 1,
        'createdAt': 1,
        'periods.startDate': 1,
        'periods.endDate': 1,
        'periods.description': 1,
        'dType': 1,
        'description': 1,
        'thumbnail': 1,
        'rejected': 1,
        'reason': 1,
        'limited': 1,
        'maxItems': 1,
        'otherSavings': 1,
        'promoCode': 1,
        'savingType': 1,
        'savedPercent': 1,
        'retailer': 1
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        data: {
          $push: '$$ROOT'
        }
      }
    },
    {
      $project: {
        total: 1,
        _id: 0,
        data: {
          $slice: ['$data', skip, limit]
        }
      }
    }
    ])
      .allowDiskUse(true)
      .exec((err, allDeals) => {
        if (err) {
          return reject(err);
        }
        return resolve(allDeals && allDeals.length > 0 ? { data: attachRetailerToDeals(allDeals[0].data), total: allDeals[0].total } : { total: 0, data: [] });
      });
  });
}

module.exports.getAllDealsForCSV = (queryParams) => {
  const searchText = queryParams.search;
  let filterTextQuery = {};
  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'title': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'product.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'category.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'client.name': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    }
  }
  const query = {
    active: true
  };
  if (queryParams.dealId) {
    query._id = mongoose.Types.ObjectId(queryParams.dealId)
  }
  if (queryParams.dType) {
    query.dType = queryParams.dType
  }

  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day'),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day')
    };
  }

  return new Promise((resolve, reject) => {
    DealSchema.aggregate([{
      $match: query
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $lookup:
      {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $lookup: {
        from: 'retailers',
        localField: 'otherSavings.retailer',
        foreignField: '_id',
        as: 'otherSavings.retailer'
      }
    },
    // {
    //   $unwind: {
    //     path: '$otherSavings.retailer',
    //     preserveNullAndEmptyArrays: true
    //   },
    // },
    {
      $lookup:
      {
        from: 'periods',
        localField: 'periods',
        foreignField: '_id',
        as: 'periods'
      }
    },
    {
      $lookup:
      {
        from: 'clients',
        localField: 'client',
        foreignField: '_id',
        as: 'client'
      }
    },
    {
      $unwind: '$client'
    },
    {
      $match: filterTextQuery
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $project: {
        '_id': 1,
        'active': 1,
        'quantity': 1,
        'approved': 1,
        'limited': 1,
        'periods._id': 1,
        'rejected': 1,
        'deactivated': 1,
        'title': 1,
        'description': 1,
        'client._id': 1,
        'weight': 1,
        'category._id': 1,
        'product._id': 1,
        'savingAmount': 1,
        'maxItems': 1,
        'dType': 1,
        'sid': 1
      }
    }
    ]).exec((err, allDeals) => {
      if (err) {
        return reject(err);
      }
      return resolve(allDeals);
    });
  });
}

module.exports.getAllDealsForClient = (client) => {
  const query = {
    client,
    active: true
  };
  return new Promise((resolve, reject) => {
    DealSchema.find(query)
      .populate({ path: 'category', model: categorySchema })
      .populate({ path: 'product', model: ProductSchema })
      .populate({ path: 'otherSavings.retailer', model: RetailerSchema })
      .populate({ path: 'periods', model: PeriodSchema })
      .populate({ path: 'client', model: clientSchema })
      .lean().exec((err, allDeals) => {
        if (err) {
          reject(err);
        }
        resolve(allDeals.map(deal => ({
          ...deal,
          // eslint-disable-next-line no-nested-ternary
          status: deal.rejected ? 'Rejected' : deal.approved ? 'Approved' : 'Pending'
        })));
      });
  });
}

module.exports.getTodayFlashDeal = (params, type = 'forMobileApp') => {
  let query;
  if (type === 'addFlashDeal') {
    query = {
      $or: [
        {
          startDate: {
            $lte: params.startDate
          },
          endDate: {
            $gte: params.endDate
          },
          dType: params.dType,
          active: true,
        },
        {
          $and: [{
            startDate: {
              $gte: params.startDate
            }
          },
          {
            startDate: {
              $lte: params.endDate
            }
          },
          {
            dType: params.dType,
            active: true
          }]
        },
        {
          $and: [{
            endDate: {
              $gte: params.startDate
            }
          },
          {
            endDate: {
              $lte: params.endDate
            }
          },
          {
            dType: params.dType,
            active: true
          }]
        },
        // {
        //   startDate: {
        //     $or: [{
        //       gte: params.startDate,
        //       lte: params.endDate
        //     }]
        //   },
        //   dType: params.dType,
        //   active: true
        // },
        // {
        //   endDate: {
        //     $or: [{
        //       gte: params.startDate,
        //       lte: params.endDate
        //     }]
        //   },
        //   dType: params.dType,
        //   active: true
        // }
      ]
    };
  } else if (type === 'forMobileApp') { // here start date is the current date
    query = {
      startDate: {
        $lte: params.startDate
      },
      endDate: {
        $gte: params.endDate
      },
      dType: params.dType,
      active: true
    };
  }
  return new Promise((resolve, reject) => {
    DealSchema.findOne(query, (err, deal) => {
      if (err) {
        reject(err);
      }
      resolve(deal);
    });
  });
}

module.exports.getDealsByCategoryId = (category) => {
  const todayDate = new Date();
  const query = {
    active: true,
    approved: true,
    deactivated: false,
    category,
    rejected: false
  };
  return new Promise((resolve, reject) => {
    DealSchema.find(query).populate('category periods').lean().exec((err, allDeals) => {
      if (err) {
        reject(err);
      }
      const filteredDeals = [];
      allDeals.map((deal) => {
        for (let i = 0; i < deal.periods.length; i++) {
          if (deal.periods[i].startDate <= todayDate && deal.periods[i].endDate >= todayDate) {
            const dealData = { ...deal };
            dealData.description = `For each ${dealData.title} purchased between ${moment(dealData.periods[i].startDate).format('DD-MM-YYYY')} until ${moment(dealData.periods[i].endDate).format('DD-MM-YYYY')}, get € ${dealData.savingAmount} back.`;
            filteredDeals.push(dealData);
            // break;
          }
        }
        return {};
      });
      resolve(filteredDeals);
    });
  });
}

module.exports.getDealByRetailerId = (retailerId) => {
  return new Promise((resolve, reject) => {
    DealSchema.find({ 'otherSavings.retailer': retailerId }).exec((err, deals) => {
      if (err) {
        reject(err);
      }
      resolve(deals);
    });
  });
}

module.exports.getDealsRealtedToProducts = (products) => {
  const todayDate = new Date();
  const query = {
  };

  if (products.length > 0) {
    query.$or = [];
    for (let i = 0; i < products.length; i++) {
      query.$or.push({
        product: products[i].product,
        quantity: { $lte: products[i].quantity },
        active: true,
        approved: true,
        deactivated: false
      });
    }
  }
  return new Promise((resolve, reject) => {
    DealSchema.find(query)
      .populate({ path: 'category', model: categorySchema })
      .populate({ path: 'product', model: ProductSchema })
      .populate({ path: 'otherSavings.retailer', model: RetailerSchema })
      .populate({ path: 'periods', model: PeriodSchema })
      .lean().exec((err, allDeals) => {
        if (err) {
          reject(err);
        }
        const filteredDeals = [];
        allDeals.map((deal) => {
          for (let i = 0; i < deal.periods.length; i++) {
            if (deal.periods[i].startDate <= todayDate && deal.periods[i].endDate >= todayDate) {
              const dealData = { ...deal };
              dealData.description = `For each ${dealData.title} purchased between ${moment(dealData.periods[i].startDate).format('DD-MM-YYYY')} until ${moment(dealData.periods[i].endDate).format('DD-MM-YYYY')}, get € ${dealData.savingAmount} back.`;
              filteredDeals.push(dealData);
              // break;
            }
          }
          return {};
        });
        resolve(filteredDeals);
      });
  });
}

module.exports.getDealsCountWrtCategories = (category) => {
  const todayDate = new Date();
  const query = {
    category,
    active: true,
    deactivated: false,
    approved: true
  };
  return new Promise((resolve, reject) => {
    DealSchema.find(query)
      .populate({ path: 'periods', model: PeriodSchema })
      .lean().exec((err, allDeals) => {
        if (err) {
          reject(err);
        }
        const filteredDeals = [];
        allDeals.map((deal) => {
          for (let i = 0; i < deal.periods.length; i++) {
            if (deal.periods[i].startDate <= todayDate && deal.periods[i].endDate >= todayDate) {
              const dealData = { ...deal };
              dealData.description = `For each ${dealData.title} purchased between ${moment(dealData.periods[i].startDate).format('DD-MM-YYYY')} until ${moment(dealData.periods[i].endDate).format('DD-MM-YYYY')}, get € ${dealData.savingAmount} back.`;
              filteredDeals.push(dealData);
            }
          }
          return {};
        });
        resolve(filteredDeals.length);
      });
  });
}

module.exports.getDealsCountWrtSectors = (sector) => {
  const todayDate = new Date();
  const query = {
    category: { $in: sector.categories },
    active: true,
    deactivated: false,
    approved: true
  };
  return new Promise((resolve, reject) => {
    DealSchema.find(query)
      .populate({ path: 'periods', model: PeriodSchema })
      .lean().exec((err, allDeals) => {
        if (err) {
          reject(err);
        }
        const filteredDeals = [];
        allDeals.map((deal) => {
          for (let i = 0; i < deal.periods.length; i++) {
            if (deal.periods[i].startDate <= todayDate && deal.periods[i].endDate >= todayDate) {
              const dealData = { ...deal };
              dealData.description = `For each ${dealData.title} purchased between ${moment(dealData.periods[i].startDate).format('DD-MM-YYYY')} until ${moment(dealData.periods[i].endDate).format('DD-MM-YYYY')}, get € ${dealData.savingAmount} back.`;
              filteredDeals.push(dealData);
            }
          }
          return {};
        });
        resolve(filteredDeals.length);
      });
  });
}

module.exports.incrementAvailedDealCount = (data) => {
  return new Promise((resolve, reject) => {
    DealSchema.findByIdAndUpdate(data.deal, { $inc: { availedItems: data.quantity } }, { new: true }).lean().exec((err, updatedDeal) => {
      if (err) {
        reject(err);
      }
      resolve(updatedDeal);
    });
  });
}

module.exports.decrementAvailedDealCount = (dealId) => {
  return new Promise((resolve, reject) => {
    DealSchema.findByIdAndUpdate(dealId, { $inc: { availedItems: -1 } }, { new: true }).lean().exec((err, updatedDeal) => {
      if (err) {
        reject(err);
      }
      resolve(updatedDeal);
    });
  });
}

module.exports.getFlashDealByPeriod = (periods) => {
  return new Promise((resolve, reject) => {
    DealSchema.aggregate([
      {
        $match: {
          active: true,
          approved: true,
          rejected: false,
          deactivated: false,
          dType: 'flash'
        }
      },
      {
        $lookup: {
          from: 'periods', localField: 'periods', foreignField: '_id', as: 'periods'
        }
      },
      {
        $unwind: '$periods'
      },
      {
        $match: {
          'periods.description': { $in: periods }
        }
      }
    ], (err, deals) => {
      if (err) {
        reject(err);
      }
      resolve(deals);
    });
  });
}

function attachRetailerToDeals(deals) {
  let updatedDealsArray = [];
  for (let i = 0; i < deals.length; i++) {
    let deal = { ...deals[i] };
    if (deal.otherSavings.length > 0) {
      for (let j = 0; j < deal.otherSavings.length; j++) {
        for (let k = 0; k < deal.retailer.length; k++) {
          if (deal.otherSavings[j].retailer.toString() === deal.retailer[k]._id.toString()) {
            deal.otherSavings[j].retailer = deal.retailer[k];
          }
        }
      }
    }
    delete deal.retailer;
    updatedDealsArray.push(deal)
  }
  return updatedDealsArray;
}

module.exports.getDealsByMultipleIds = (dealIds) => {
  return new Promise((resolve, reject) => {
    DealSchema.find({ _id: { $in: dealIds } }).lean().exec((err, updatedDeal) => {
      if (err) {
        reject(err);
      }
      resolve(updatedDeal);
    });
  });
}
