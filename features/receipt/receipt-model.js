const moment = require('moment');
const mongoose = require('mongoose');
const s3Zip = require('s3-zip');
const AWS = require('aws-sdk');
const config = require('../../config');

const ReceiptSchema = require('./receipt-schema');
module.exports.createReceipt = (data) => {
  // const receipt = new ReceiptSchema(data);
  return new Promise((resolve, reject) => {
    ReceiptSchema.create(data, (err, createdReceipts) => {
      if (err) {
        reject(err);
      }
      resolve(createdReceipts);
    });
    // receipt.save((err, createdReceipt) => {
    //   if (err) {
    //     reject(err);
    //   }
    //   resolve(createdReceipt);
    // });
  });
}

module.exports.updateReceipt = (updateReceiptData, receiptId) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.findByIdAndUpdate(receiptId, updateReceiptData, { new: true }).populate('user products').lean().exec((err, updatedReceipt) => {
      if (err) {
        reject(err);
      }
      resolve(updatedReceipt);
    });
  });
}

module.exports.updateReceiptByQuery = (query, updateReceiptData) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.findOneAndUpdate(query, updateReceiptData, { new: true }, (err, updatedReceipt) => {
      if (err) {
        reject(err);
      }
      resolve(updatedReceipt);
    });
  });
}

module.exports.deleteReceipt = (receiptId) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.findOneAndUpdate({ _id: receiptId }, { active: false }, { new: true }, (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getReceiptById = (receiptId, doPopulate) => {
  let populateString = '';
  if (doPopulate) {
    populateString = 'user'
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.findById(receiptId).populate(populateString).lean().exec((err2, receipt) => {
      if (err2) {
        reject(err2);
      }
      resolve(receipt);
    });
  });
}

module.exports.getReceiptByUserId = (user) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.find({ user }).deepPopulate('user family deals retailer_info.retailer products.product').lean().exec((err2, receipts) => {
      if (err2) {
        reject(err2);
      }
      resolve(receipts);
    });
  });
}

module.exports.getAllReceipts = (body, isAdmin) => {
  const searchText = body.search;
  const query = {
    active: true
  };
  if (body.deleted) {
    query.active = false;
  }

  console.log(body);
  const sort = {};
  if (body.minDate && body.maxDate) {
    if (body.byReceiptDate) {
      query.receipt_date = {
        $gte: body.minDate,
        $lte: body.maxDate
      };
    } else {
      query.createdAt = {
        $gte: body.minDate,
        $lte: body.maxDate
      };
    }
  }
  if (body.status) {
    query.status = body.status;
  }
  if (body.user) {
    query.user = mongoose.Types.ObjectId(body.user);
  }
  if (body.receiptId) {
    query._id = mongoose.Types.ObjectId(body.receiptId);
  }
  if (body.family) {
    delete query.user;
    query.family = body.family;
  }
  if (body.user) {
    sort.createdAt = -1;
  } else {
    sort.createdAt = 1;
  }

  return new Promise((resolve, reject) => {
    if (isAdmin) {
      let { limit = 30, skip = 0 } = body;
      skip = skip * limit;
      let searchObj = {};
      if (searchText) {
        searchObj = {
          $or: [
            { 'user.username': { $regex: `.*${searchText}.*`, $options: '-i' } },
            { 'retailer_info.retailer.name': { $regex: `.*${searchText}.*`, $options: '-i' } }
          ]
        };
      }
      ReceiptSchema.aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $lookup:
          {
            from: 'families',
            localField: 'family',
            foreignField: '_id',
            as: 'family'
          }
        },
        {
          $unwind: '$family'
        },
        {
          $lookup:
          {
            from: 'retailers',
            localField: 'retailer_info.retailer',
            foreignField: '_id',
            as: 'retailer_info.retailer'
          }
        },
        {
          $unwind: {
            path: '$retailer_info.retailer',
            preserveNullAndEmptyArrays: true
          },
        },
        {
          $match: searchObj
        },
        {
          $lookup: {
            from: 'deals',
            localField: 'deals',
            foreignField: '_id',
            as: 'deals'
          }
        },
        {
          $project: {
            '_id': 1,
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'deals': 1,
            'active': 1,
            'status': 1,
            'family._id': 1,
            'family.name': 1,
            // 'products.product._id': 1,
            // 'products.product.barcode': 1,
            // 'products.product.name': 1,
            'products': 1,
            'amountSpent': 1,
            'receipt_date': 1,
            'retailer_info.retailer._id': 1,
            'retailer_info.retailer.name': 1,
            'retailer_info.shop': 1,
            'savedAmount': 1,
            'thumbnails': 1,
            'image': 1,
            'receipt_id': 1,
            'createdAt': 1,
            'updatedAt': 1,
            'reason': 1,
            'processedAt': 1,
            'acceptedAt': 1,
            'rejectedAt': 1,
            'downloadedAt': 1
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
      ]).allowDiskUse(true)
        .exec((err2, allReceipts) => {
          if (err2) {
            return reject(err2);
          }
          return resolve(allReceipts && allReceipts.length > 0 ? allReceipts[0] : { total: 0, data: [] });
        });
      // });
    }
    //   else {
    //     ReceiptSchema.find(query).sort(sort).skip(skip).limit(limit).deepPopulate('user family deals retailer_info.retailer products.product').lean().exec((err, allReceipts) => { // eslint-disable-line
    //       if (err) {
    //         return reject(err);
    //       }
    //       ReceiptSchema.count(query, (err2, count) => {
    //         if (err2) {
    //           return reject(err2);
    //         }
    //         return resolve({
    //           allReceipts,
    //           totalReceiptsCount: count
    //         });
    //       });
    //     });
    //   }
    // } 
    else {
      ReceiptSchema.find(query).sort(sort).deepPopulate('user family deals retailer_info.retailer products.product').lean().exec((err, allReceipts) => { // eslint-disable-line
        if (err) {
          return reject(err);
        }
        resolve(allReceipts);
      });
    }
  });
}

module.exports.getAllReceiptsForCSV = (body, isAdmin) => {
  const searchText = body.search;
  const query = {};
  if (!isAdmin) {
    query.active = true;
  }

  console.log(body);
  const sort = {};
  if (body.minDate && body.maxDate) {
    if (body.byReceiptDate) {
      query.receipt_date = {
        $gte: body.minDate,
        $lte: body.maxDate
      };
    } else {
      query.createdAt = {
        $gte: body.minDate,
        $lte: body.maxDate
      };
    }
  }
  if (body.status) {
    query.status = body.status;
  }
  if (body.user) {
    query.user = mongoose.Types.ObjectId(body.user);
  }
  if (body.receiptId) {
    query._id = body.receiptId;
  }
  if (body.family) {
    delete query.user;
    query.family = body.family;
  }
  if (body.user) {
    sort.createdAt = -1;
  } else {
    sort.createdAt = 1;
  }

  return new Promise((resolve, reject) => {
    let searchObj = {};
    if (searchText) {
      searchObj = {
        $or: [
          { 'user.username': { $regex: `.*${searchText}.*`, $options: '-i' } },
          { 'retailer_info.retailer.name': { $regex: `.*${searchText}.*`, $options: '-i' } }
        ]
      };
    }
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup:
        {
          from: 'families',
          localField: 'family',
          foreignField: '_id',
          as: 'family'
        }
      },
      {
        $unwind: '$family'
      },
      {
        $lookup:
        {
          from: 'retailers',
          localField: 'retailer_info.retailer',
          foreignField: '_id',
          as: 'retailer_info.retailer'
        }
      },
      {
        $unwind: {
          path: '$retailer_info.retailer',
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $match: searchObj
      },
      {
        $lookup: {
          from: 'deals',
          localField: 'deals',
          foreignField: '_id',
          as: 'deals'
        }
      },
      {
        $project: {
          '_id': 1,
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'deals': 1,
          'active': 1,
          'status': 1,
          'family._id': 1,
          'family.name': 1,
          // 'products.product._id': 1,
          // 'products.product.barcode': 1,
          // 'products.product.name': 1,
          'products': 1,
          'amountSpent': 1,
          'receipt_date': 1,
          'retailer_info.retailer._id': 1,
          'retailer_info.retailer.name': 1,
          'retailer_info.shop': 1,
          'savedAmount': 1,
          'thumbnails': 1,
          'image': 1,
          'createdAt': 1,
          'updatedAt': 1,
          'reason': 1,
          'processedAt': 1,
          'acceptedAt': 1,
          'rejectedAt': 1,
          'downloadedAt': 1
        }
      }
    ]).allowDiskUse(true)
      .exec((err2, allReceipts) => {
        if (err2) {
          return reject(err2);
        }
        return resolve(allReceipts);
      });

  });
}
module.exports.getTopRawardableUsers = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: {
          active: true,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          status: 'Accepted'
        },
      }, {
        $group: {
          _id: '$user',
          totalAmountSaved: { $sum: '$savedAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user' } },
      {
        $project: {
          totalAmountSaved: 1,
          count: 1,
          'user._id': 1,
          'user.cognitoId': 1,
          'user.username': 1,
          'user.email': 1
        }
      },
      { $sort: { totalAmountSaved: -1 } },
      { $limit: 5 }
    ])
      .allowDiskUse(true)
      .exec((err, users) => {
        if (err) {
          reject(err);
        }
        resolve(users);
      });
  });
}

module.exports.getReceiptByFamilyId = (family) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.find({ family, active: true }).deepPopulate('products.product').lean().exec((err, allReceipts) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      resolve(allReceipts);
    });
  });
}

module.exports.getCurrentMonthSavedAmounts = (query) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$family',
          currentMonthSavedAmount: { $sum: '$savedAmount' }
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, data) => {
        if (err) {
          reject(err);
        } else {
          const modifiedData = {};
          data.map(d => {
            modifiedData[`${d._id}`] = d.currentMonthSavedAmount;
            return d;
          })
          resolve(modifiedData);
        }
      });
  });
}

module.exports.getReceiptsGroupByFamilyId = (requestQuery, queryParams) => {
  const query = { ...requestQuery };
  const searchText = queryParams.search;
  let searchQuery = {
    $and: [{}]
  };
  if (queryParams.familyAdminId) {
    searchQuery['$and'].push({
      'family.familyAdmin': mongoose.Types.ObjectId(queryParams.familyAdminId)
    });
  }
  if (searchText) {
    searchQuery['$and'].push({
      $or: [
        { 'family.accountDetails.account_title': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    })
  }
  let limit = parseInt(queryParams.limit || 20);
  let skip = parseInt((queryParams.skip || 0) * limit);
  console.log(searchQuery)
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: { family: '$family' },
          totalReceipts: { $sum: 1 },
          results: { $addToSet: '$$ROOT' }
        }
      },
      {
        $addFields: {
          family: '$_id.family'
        }
      },
      {
        $project: {
          _id: false
        }
      },
      {
        $lookup:
        {
          from: 'families',
          localField: 'family',
          foreignField: '_id',
          as: 'family'
        }
      },
      {
        $unwind: '$family'
      },
      {
        $match: searchQuery
      },
      {
        $lookup:
        {
          from: 'wallets',
          localField: 'family.wallet',
          foreignField: '_id',
          as: 'family.wallet'
        }
      },
      {
        $unwind: '$family.wallet'
      },
      {
        $sort: {
          'family._id': -1
        }
      },
      {
        $project: {
          totalReceipts: 1,
          'family.familyAdmin': 1,
          'family.wallet': 1,
          'family.accountDetails': 1,
          'family._id': 1,
          results: 1
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
      .exec((err, summaryData) => {
        if (err) {
          reject(err);
        } else {
          console.log(summaryData)
          let data = summaryData && summaryData.length > 0 ? summaryData[0].data : [];
          const modifiedData = [];
          for (let i = 0; i < data.length; i++) {
            const item = { ...data[i] };
            let amountSaved = 0;
            let amountSpent = 0;
            for (let j = 0; j < data[i].results.length; j++) {
              amountSaved += data[i].results[j].savedAmount;
              amountSpent += data[i].results[j].amountSpent;
            }
            item.amountSaved = amountSaved;
            item.amountSpent = amountSpent;
            item.outstandingBalance = data[i].family.wallet.balance;
            item.family.wallet = data[i].family.wallet._id;
            modifiedData.push(item);
            delete item.results;
          }
          resolve({
            total: summaryData && summaryData.length > 0 ? summaryData[0].total : 0,
            data: modifiedData
          });
        }
      });
  });
}

module.exports.getReceiptsGroupByFamilyIdForCSV = (requestQuery, queryParams) => {
  const query = { ...requestQuery };
  const searchText = queryParams.search;
  let searchQuery = {
    $and: [{}]
  };
  if (queryParams.familyAdminId) {
    searchQuery['$and'].push({
      'family.familyAdmin': mongoose.Types.ObjectId(queryParams.familyAdminId)
    });
  }
  if (searchText) {
    searchQuery['$and'].push({
      $or: [
        { 'family.accountDetails.account_title': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    })
  }
  console.log(searchQuery)
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: { family: '$family' },
          totalReceipts: { $sum: 1 },
          results: { $addToSet: '$$ROOT' }
        }
      },
      {
        $addFields: {
          family: '$_id.family'
        }
      },
      {
        $project: {
          _id: false
        }
      },
      {
        $lookup:
        {
          from: 'families',
          localField: 'family',
          foreignField: '_id',
          as: 'family'
        }
      },
      {
        $unwind: '$family'
      },
      {
        $match: searchQuery
      },
      {
        $lookup:
        {
          from: 'wallets',
          localField: 'family.wallet',
          foreignField: '_id',
          as: 'family.wallet'
        }
      },
      {
        $unwind: '$family.wallet'
      },
      {
        $sort: {
          'family._id': -1
        }
      },
      {
        $project: {
          totalReceipts: 1,
          'family.familyAdmin': 1,
          'family.wallet': 1,
          'family.accountDetails': 1,
          'family._id': 1,
          results: 1
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, data) => {
        if (err) {
          reject(err);
        } else {
          const modifiedData = [];
          for (let i = 0; i < data.length; i++) {
            const item = { ...data[i] };
            let amountSaved = 0;
            let amountSpent = 0;
            for (let j = 0; j < data[i].results.length; j++) {
              amountSaved += data[i].results[j].savedAmount;
              amountSpent += data[i].results[j].amountSpent;
            }
            item.amountSaved = amountSaved;
            item.amountSpent = amountSpent;
            item.outstandingBalance = data[i].family.wallet.balance;
            item.family.wallet = data[i].family.wallet._id;
            modifiedData.push(item);
            delete item.results;
          }
          resolve(modifiedData);
        }
      });
  });
}

module.exports.getReceiptsForCommunityPointsGroupByFamilyId = (query) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: { family: '$family' },
          totalReceipts: { $sum: 1 },
          results: { $addToSet: '$$ROOT' }
        }
      },
      {
        $addFields: {
          family: '$_id.family'
        }
      },
      {
        $project: {
          _id: false
        }
      },
      {
        $lookup:
        {
          from: 'families',
          localField: 'family',
          foreignField: '_id',
          as: 'family'
        }
      },
      {
        $unwind: '$family'
      },
      {
        $lookup:
        {
          from: 'wallets',
          localField: 'family.wallet',
          foreignField: '_id',
          as: 'family.wallet'
        }
      },
      {
        $unwind: '$family.wallet'
      },
      {
        $project: {
          totalReceipts: 1,
          'family.wallet': 1,
          'family._id': 1,
          results: 1
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, data) => {
        if (err) {
          reject(err);
        } else {
          const modifiedData = [];
          for (let i = 0; i < data.length; i++) {
            const item = {
              family: data[i].family._id,
              points: 0,
              totalCommunityPoints: data[i].family.wallet.totalCommunityPoints || 0,
              remainingCommunityPoints: data[i].family.wallet.remainingCommunityPoints || 0,
              redeemedCommunityPoints: data[i].family.wallet.redeemedCommunityPoints || 0
            };
            for (let j = 0; j < data[i].results.length; j++) {
              for (let k = 0; k < data[i].results[j].products.length; k++) {
                if (data[i].results[j].products[k].points) {
                  item.points += data[i].results[j].products[k].points;
                }
              }
            }
            modifiedData.push(item);
          }
          resolve(modifiedData);
        }
      });
  });
}

module.exports.getReceiptDataByCategory = (query, period) => {
  const requestQuery = {
    ...query,
    status: 'Accepted',
    active: true
  };
  if (period) {
    requestQuery.createdAt = { $gte: period.start, $lte: period.end };
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(requestQuery)
      .deepPopulate('deals.category products.category').lean().exec((err, receipts) => {
        if (err) {
          reject(err);
        } else {
          let totalAmountSpent = 0;
          let totalAmountSaved = 0;
          let categoryItems = [];
          for (let i = 0; i < receipts.length; i++) {
            for (let j = 0; j < receipts[i].products.length; j++) {
              totalAmountSpent += receipts[i].products[j].amount * receipts[i].products[j].quantity;
              if (receipts[i].products[j].category) {
                this.addOrUpdateCateogryAmountSpent(categoryItems, receipts[i].products[j].category.name, receipts[i].products[j].amount * receipts[i].products[j].quantity);
              } else {
                this.addOrUpdateCateogryAmountSpent(categoryItems, 'Others', receipts[i].products[j].amount * receipts[i].products[j].quantity);
              }
            }
            for (let q = 0; q < receipts[i].deals.length; q++) {
              totalAmountSaved += receipts[i].deals[q].savingAmount;
              if (receipts[i].deals[q].category) {
                this.addOrUpdateCateogryAmountSavings(categoryItems, receipts[i].deals[q].category.name, receipts[i].deals[q].savingAmount);
              } else {
                this.addOrUpdateCateogryAmountSavings(categoryItems, 'Others', receipts[i].deals[q].savingAmount);
              }
            }
          }
          categoryItems = categoryItems.map(item => ({
            category: item.category,
            amountSaving: `${item.amountSaving ? parseFloat((item.amountSaving / totalAmountSaved) * 100).toFixed(0) : 0}%`,
            amountSpent: `${item.amountSpent ? parseFloat((item.amountSpent / totalAmountSpent) * 100).toFixed(0) : 0}%`
          }));
          resolve(categoryItems);
        }
      });
  });
}
module.exports.addOrUpdateCateogryAmountSpent = (categoryItems, category, amountSpent) => {
  let check = false;
  for (let k = 0; k < categoryItems.length; k++) {
    if (categoryItems[k].category.toString() === category.toString()) {
      if (categoryItems[k].amountSpent) {
        categoryItems[k].amountSpent += parseFloat(amountSpent);
      } else {
        categoryItems[k].amountSpent = parseFloat(amountSpent);
      }
      check = true;
      break;
    }
  }
  if (!check) {
    categoryItems.push({
      category,
      amountSpent
    });
  }
}

module.exports.addOrUpdateCateogryAmountSavings = (categoryItems, category, amountSaving) => {
  let check = false;
  for (let k = 0; k < categoryItems.length; k++) {
    if (categoryItems[k].category.toString() === category.toString()) {
      if (categoryItems[k].amountSaving) {
        categoryItems[k].amountSaving += parseFloat(amountSaving);
      } else {
        categoryItems[k].amountSaving = parseFloat(amountSaving);
      }
      check = true;
      break;
    }
  }
  if (!check) {
    categoryItems.push({
      category,
      amountSaving
    });
  }
}

module.exports.getTotalReceiptsCount = (queryParams, status) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (status) {
    query.status = status;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.count(query, (err, receiptsCount) => {
      if (err) {
        reject(err);
      }
      resolve(receiptsCount);
    });
  });
}

module.exports.getTotalReceiptsCountBelowSpecificDate = (minDate, status) => {
  const query = {
    createdAt: {
      $lte: moment(new Date(minDate)).utc().startOf('day').toDate()
    }
  };
  if (status) {
    query.status = status;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.count(query, (err, receiptsCount) => {
      if (err) {
        reject(err);
      }
      resolve(receiptsCount);
    });
  });
}

module.exports.getReceiptDealsCount = (queryParams) => {
  const query = {
    'deals.0': { $exists: true }
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let count = 0;
      if (receipts) {
        receipts.map((r) => {
          count += r.deals.length;
          return r;
        });
      }
      resolve(count);
    });
  });
}

module.exports.getReceiptsTotalSale = (queryParams) => {
  const query = {
    status: 'Accepted'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (queryParams.deals) {
    query.deals = queryParams.deals;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let totalSales = 0;
      if (receipts) {
        receipts.map((r) => {
          totalSales += r.amountSpent;
          return r;
        });
      }
      resolve(totalSales);
    });
  });
}

module.exports.getReceiptsTotalSaleBelowSpecificDate = (minDate) => {
  const query = {
    status: 'Accepted',
    createdAt: {
      $lte: moment(new Date(minDate)).utc().startOf('day').toDate()
    }
  };
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let totalSales = 0;
      if (receipts) {
        receipts.map((r) => {
          totalSales += r.amountSpent;
          return r;
        });
      }
      resolve(totalSales);
    });
  });
}

module.exports.getReceiptsTotalSavings = (queryParams) => {
  const query = {
    status: 'Accepted'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (queryParams.deals) {
    query.deals = queryParams.deals;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let totalSaved = 0;
      if (receipts) {
        receipts.map((r) => {
          totalSaved += r.savedAmount;
          return r;
        });
      }
      resolve(totalSaved);
    });
  });
}

module.exports.getProductsQuantity = (queryParams) => {
  const query = {
    status: 'Accepted'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (queryParams.deals) {
    query.deals = queryParams.deals;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let totalProducts = 0;
      if (receipts) {
        receipts.map((r) => {
          if (r.products) {
            r.products.map((p) => {
              totalProducts += p.quantity;
              return p;
            });
          }
          return r;
        });
      }
      resolve(totalProducts);
    });
  });
}

module.exports.getReceiptsTotalSavingsBelowSpecificDate = (minDate) => {
  const query = {
    status: 'Accepted',
    createdAt: {
      $lte: moment(new Date(minDate)).startOf('day').toDate()
    }
  };
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, (err, receipts) => {
      if (err) {
        reject(err);
      }
      let totalSaved = 0;
      if (receipts) {
        receipts.map((r) => {
          totalSaved += r.savedAmount;
          return r;
        });
      }
      resolve(totalSaved);
    });
  });
}

module.exports.getAverageShopsCount = (queryParams) => {
  const query = {
    status: 'Accepted'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: { retailer: '$retailer_info.retailer' },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          retailer: '$_id.retailer'
        }
      },
      {
        $project: {
          _id: false
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, receipts) => {
        if (err) {
          reject(err);
        }
        resolve(receipts.length);
      });
  });
}

module.exports.getUsersCountWhoUploadedAtLeastAReceipt = (queryParams) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }

  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [{
        $match: query
      },
      {
        $group: {
          _id: { user: 'user' },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          user: '$user',
        }
      },
      {
        $project: {
          _id: false
        }
      }]
    )
      .allowDiskUse(true)
      .exec((err, usersReceipt) => {
        if (err) {
          reject(err);
        }
        resolve(usersReceipt.length);
      });
  });
}

module.exports.getFamiliesCountWhoUploadedAtLeastAReceipt = (queryParams) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [
        {
          $match: query
        },
        {
          $group: {
            _id: { family: '$family' },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            family: '$_id.family'
          }
        },
        {
          $project: {
            _id: false
          }
        }
      ]
    )
      .allowDiskUse(true)
      .exec((err, familiesCount) => {
        if (err) {
          reject(err);
        }
        resolve(familiesCount.length);
      });
  });
}

module.exports.getTotalReceiptsCountGroupedByDates = (queryParams) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [
        {
          $match: query
        },
        {
          $project:
          {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            savedAmount: 1,
            products: 1,
            status: 1
          }
        },
        {
          $group: {
            _id: { date: '$date' },
            count: { $sum: 1 },
            docs: { $addToSet: '$$ROOT' }
          }
        },
        {
          $addFields: {
            date: '$_id.date'
          }
        },
        {
          $sort: {
            date: 1
          }
        },
        {
          $project: {
            _id: false,
            count: 1,
            status: 1,
            date: 1,
            docs: 1
          }
        }
      ]
    )
      .allowDiskUse(true)
      .exec((err, receipts) => {
        if (err) {
          reject(err);
        }
        const modifiedData = [];
        for (let i = 0; i < receipts.length; i++) {
          const totalReceipts = receipts[i].count;
          let receiptsFound = 0;
          let productsQuantity = 0;
          let totalSaved = 0;
          receipts[i].docs.map((item) => {
            if (item.status === 'Accepted') {
              receiptsFound++;
              totalSaved += parseFloat(item.savedAmount);
            }
            item.products.map((product) => {
              productsQuantity += product.quantity;
              return product;
            });
            return item;
          });
          modifiedData.push({
            date: receipts[i].date,
            totalReceipts,
            receiptsFound,
            acceptancePercentage: parseFloat((receiptsFound / totalReceipts) * 100).toFixed(2),
            quantity: parseFloat(productsQuantity).toFixed(2),
            totalSaved: parseFloat(totalSaved).toFixed(2),
            // docs: receipts[i].docs
          });
        }
        resolve(modifiedData);
      });
  });
}
// const usersBoughtSpecificDeal = await this.receiptDB.(query);
// const familiesBoughtSpecificDeal = await this.receiptDB.(query);
module.exports.getTotalUsersWrtDeal = (queryParams) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (queryParams.deals) {
    query.deals = queryParams.deals;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [{
        $match: query
      },
      {
        $group: {
          _id: { user: '$user' },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          user: '$_id.user'
        }
      },
      {
        $project: {
          _id: false
        }
      }]
    )
      .allowDiskUse(true)
      .exec((err, usersReceipt) => {
        if (err) {
          reject(err);
        }
        resolve(usersReceipt.length);
      });
  });
}

module.exports.getTotalFamiliesWrtDeal = (queryParams) => {
  const query = {};
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  if (queryParams.deals) {
    query.deals = queryParams.deals;
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [
        {
          $match: query
        },
        {
          $group: {
            _id: { family: '$family' },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            family: '$_id.family'
          }
        },
        {
          $project: {
            _id: false
          }
        }
      ]
    )
      .allowDiskUse(true)
      .exec((err, familiesCount) => {
        if (err) {
          reject(err);
        }
        resolve(familiesCount.length);
      });
  });
}

module.exports.getUserReceiptsByFamilyIdGroupedByStatus = (familyId) => {
  const query = {
    family: familyId,
    active: true
  };

  return new Promise((resolve, reject) => {
    ReceiptSchema.aggregate(
      [{
        $match: query
      },
      {
        $group: {
          _id: { status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          status: '$_id.status'
        }
      },
      {
        $project: {
          _id: false
        }
      }]
    )
      .allowDiskUse(true)
      .exec((err, usersReceipts) => {
        if (err) {
          reject(err);
        }
        const responseData = {};
        for (let i = 0; i < usersReceipts.length; i++) {
          responseData[`${usersReceipts[i].status}`] = usersReceipts[i].count
        }
        resolve(responseData)
      });
  });
}

module.exports.getMonthlyReceiptsForImages = (query) => {
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, '_id image createdAt').sort({ createdAt: 1 }).exec((err, receipts) => {
      if (err) {
        reject(err);
      }
      resolve(receipts);
    });
  });
}

module.exports.getUserPaymentFromReceipts = (user) => {
  const query = {
    user,
    status: 'Accepted',
    savedAmount: { $gt: 0 }
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, '_id acceptedAt createdAt savedAmount').sort({ acceptedAt: 1 }).exec((err, receipts) => {
      if (err) {
        reject(err);
      }
      resolve(receipts);
    });
  });
}

module.exports.getAllUserPaymentsFromReceipts = () => {
  const query = {
    status: 'Accepted',
    savedAmount: { $gt: 0 }
  }
  return new Promise((resolve, reject) => {
    ReceiptSchema.find(query, '_id acceptedAt createdAt savedAmount user family createdAt updatedAt deals retailer_info receipt_date').populate('deals').exec((err, receipts) => {
      if (err) {
        reject(err);
      }
      resolve(receipts);
    });
  });
}

module.exports.uploadZipToS3 = (files) => {
  return new Promise((resolve, reject) => { // eslint-disable-line
    const region = config.aws.region;
    const bucket = config.assetsS3Bucket;
    const folder = 'receipt';
    const zipFileName = `receipt/${Date.now()}.zip`;

    try {
      const body = s3Zip.archive({ region, bucket }, folder, files);
      const zipParams = { params: { Bucket: bucket, Key: zipFileName } };
      const zipFile = new AWS.S3(zipParams);
      zipFile.upload({ Body: body })
        .on('httpUploadProgress', (evt) => { console.log(evt); })
        .send((e, r) => {
          if (e) {
            console.log(e);
            return reject(e);
          }
          console.log(r);
          return resolve(zipFileName);
        });
    } catch (e) {
      console.log(e);
      return reject(e);
    }
  });
}
