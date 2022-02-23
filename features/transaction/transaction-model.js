const TransactionSchema = require('./transaction-schema');

module.exports.createTransaction = data => {
  const transaction = new TransactionSchema(data);
  return new Promise((resolve, reject) => {
    transaction.save((err, createdTransaction) => {
      if (err) {
        reject(err);
      }
      resolve(createdTransaction);
    });
  });
}

module.exports.updateTransaction = (updateTransactionData, transactionId) => {
  return new Promise((resolve, reject) => {
    TransactionSchema.findOneAndUpdate({ _id: transactionId }, updateTransactionData, { new: true }).populate('user').exec((err, updatedTransaction) => {
      if (err) {
        reject(err);
      }
      resolve(updatedTransaction);
    });
  });
}

module.exports.deleteTransaction = transactionId => {
  return new Promise((resolve, reject) => {
    TransactionSchema.findOneAndUpdate({ _id: transactionId }, { active: false }, { new: true }, err2 => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllTransactions = (body, period, isAdmin) => {
  const query = {
    active: true
  };
  if (period) {
    query.createdAt = {
      $gte: period.start,
      $lte: period.end
    };
  }
  if (body.status) {
    query.status = body.status;
  }
  if (body.user) {
    query.user = body.user;
  }
  if (body.dType) {
    query.dType = body.dType;
  }
  const limit = parseInt(body.limit || 50);
  const skip = parseInt((body.skip || 0) * limit);
  return new Promise((resolve, reject) => {
    if (isAdmin) {
      if (body.search && body.search !== '') {
        const searchText = body.search;
        TransactionSchema.aggregate([
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
            $match: {
              $or: [
                { 'user.username': { $regex: `.*${searchText}.*`, $options: '-i' } }
              ]
            }
          },
          {
            $sort: { createdAt: -1 }
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
        ]
        )
          .allowDiskUse(true)
          .exec((err, data) => {
            if (err) {
              return reject(err);
            }
            return resolve(data && data.length > 0 ? data[0] : { total: 0, data: [] });
          })
      } else {
        TransactionSchema.find(query).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec((err, allTransactions) => {
          if (err) {
            reject(err);
          }
          TransactionSchema.count(query, (err2, count) => {
            if (err2) {
              reject(err2)
            } else {
              resolve({
                total: count,
                data: allTransactions
              })
            }
          })
        });
      }
    } else {
      TransactionSchema.find(query).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit).exec((err, allTransactions) => {
        if (err) {
          reject(err);
        } else {
          resolve(allTransactions);
        }
      });
    }
  });
}

module.exports.getAllTransactionsForCSV = (body, period, isAdmin) => {
  const query = {
    active: true
  };
  if (period) {
    query.createdAt = {
      $gte: period.start,
      $lte: period.end
    };
  }
  if (body.status) {
    query.status = body.status;
  }
  if (body.user) {
    query.user = body.user;
  }
  if (body.dType) {
    query.dType = body.dType;
  }
  return new Promise((resolve, reject) => {
    if (isAdmin) {
      TransactionSchema.find(query).populate('user').exec((err, allTransactions) => {
        if (err) {
          reject(err);
        }
        resolve(allTransactions)
      });

    } else {
      TransactionSchema.find(query).populate('user').exec((err, allTransactions) => {
        if (err) {
          reject(err);
        } else {
          resolve(allTransactions);
        }
      });
    }
  });
}

module.exports.getAllBankTransactions = () => {
  return new Promise((resolve, reject) => {
    TransactionSchema.find().populate('user').exec((err, allTransactions) => {
      if (err) {
        reject(err);
      } else {
        resolve(allTransactions);
      }
    });
  });
}
