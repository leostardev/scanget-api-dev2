const mongoose = require('mongoose');
const WalletTransactionSchema = require('./wallet-transaction-schema');

module.exports.createWalletTransaction = data => {
  const walletTransaction = new WalletTransactionSchema(data);
  return new Promise((resolve, reject) => {
    walletTransaction.save((err, createdTransaction) => {
      if (err) {
        reject(err);
      }
      resolve(createdTransaction);
    });
  });
}

module.exports.createBulkWalletTransactions = data => {
  return new Promise((resolve, reject) => {
    WalletTransactionSchema.insertMany(data, (err, createdTransaction) => {
      if (err) {
        reject(err);
      }
      resolve(createdTransaction);
    });
  });
}

module.exports.getAllWalletTransactions = (body) => {
  const query = {};
  if (body.user) {
    query.user = mongoose.Types.ObjectId(body.user)
  }
  return new Promise((resolve, reject) => {
    WalletTransactionSchema.aggregate([
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
        $lookup: {
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
        $project: {
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'family._id': 1,
          'family.familyAdmin': 1,
          'family.wallet': 1,
          'dType': 1,
          'description': 1,
          'amount': 1,
          'isCredited': 1,
          'createdAt': 1,
          'updatedAt': 1,
          'meta': 1
        }
      },
      {
        $sort: {
          'createdAt': -1,
        }
      }
      // {
      //   $group: {
      //     _id: '$family._id',
      //     results: { $addToSet: '$$ROOT' }
      //   }
      // },
      // {
      //   $addFields: {
      //     family: '$_id'
      //   }
      // },
      // {
      //   $project: {
      //     _id: false
      //   }
      // }
    ])
      .allowDiskUse(true)
      .exec((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
  });
}

module.exports.getUserWalletTransactions = (query, queryParams) => {
  return new Promise((resolve, reject) => {
    if (queryParams && queryParams.skip && queryParams.limit) {
      let { limit = 30, skip = 0 } = queryParams;
      limit = parseInt(limit)
      skip = parseInt(skip) * limit;
      WalletTransactionSchema.aggregate([
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
          $lookup: {
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
          $project: {
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'family._id': 1,
            'family.familyAdmin': 1,
            'family.wallet': 1,
            'dType': 1,
            'description': 1,
            'amount': 1,
            'isCredited': 1,
            'createdAt': 1,
            'updatedAt': 1,
            'meta': 1
          }
        },
        {
          $sort: {
            'createdAt': -1,
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
        .exec((err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data && data.length > 0 ? data[0] : { total: 0, data: [] })
          }
        })
    } else {
      WalletTransactionSchema.aggregate([
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
          $lookup: {
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
          $project: {
            'user._id': 1,
            'user.username': 1,
            'user.email': 1,
            'family._id': 1,
            'family.familyAdmin': 1,
            'family.wallet': 1,
            'dType': 1,
            'description': 1,
            'amount': 1,
            'isCredited': 1,
            'createdAt': 1,
            'updatedAt': 1,
            'meta': 1
          }
        },
        {
          $sort: {
            'createdAt': -1,
          }
        }
      ])
        .allowDiskUse(true)
        .exec((err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
    }
  });
}

module.exports.deleteTransaction = query => {
  return new Promise((resolve, reject) => {
    WalletTransactionSchema.remove(query, (err, deleteTransaction) => {
      if (err) {
        reject(err);
      }
      resolve(deleteTransaction);
    });
  });
}
