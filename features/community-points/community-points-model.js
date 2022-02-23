const CommunityPointsSchema = require('./community-points-schema');
const mongoose = require('mongoose');

module.exports.createCommunityPoints = (data) => {
  const communityPoints = new CommunityPointsSchema(data);
  return new Promise((resolve, reject) => {
    communityPoints.save((err, createdCommunityPoints) => {
      if (err) {
        reject(err);
      }
      resolve(createdCommunityPoints);
    });
  });
}

module.exports.getAllCommunityPointsByFamilyId = (family, period, community) => {
  const query = { family };
  if (period) {
    query.date = {
      $gte: period.start,
      $lte: period.end
    };
  }
  if (community) {
    query.community = community;
  }
  console.log(query);
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.find(query).sort({ date: -1 }).populate('community').exec((err, familyCommunityPoints) => {
      if (err) {
        reject(err);
      }
      resolve(familyCommunityPoints);
    });
  });
}

module.exports.getCommunityPointsGroupedByFamilyId = (query, searchText, familyAdminId) => {
  let limit = parseInt(query.limit || 20);
  let skip = parseInt((query.skip || 0) * limit);
  delete query.limit;
  delete query.skip;
  let filterTextQuery = {};
  let familyAdminQuery = {};
  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'familyAdmin.username': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'familyAdmin.email': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    }
  }
  if (familyAdminId) {
    familyAdminQuery = { 'family.familyAdmin': mongoose.Types.ObjectId(familyAdminId) }
  }
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.aggregate([
      {
        $match: query
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
        $lookup:
        {
          from: 'wallets',
          localField: 'family.wallet',
          foreignField: '_id',
          as: 'wallet'
        }
      },
      {
        $unwind: '$wallet'
      },
      {
        $match: familyAdminQuery
      },
      {
        $lookup: {
          from: 'users',
          localField: 'family.familyAdmin',
          foreignField: '_id',
          as: 'familyAdmin'
        }
      },
      {
        $unwind: '$familyAdmin'
      },
      {
        $match: filterTextQuery
      },
      {
        $group: {
          _id: { family: '$family._id' },
          count: { $sum: 1 },
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
        $project: {
          family: 1,
          results: 1,
          'wallet.totalCommunityPoints': 1,
          'wallet.remainingCommunityPoints': 1,
          'wallet.redeemedCommunityPoints': 1,
          'familyAdmin': 1
        }
      },
      {
        $sort: {
          family: -1
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
      .exec((err, familyCommunityPoints) => {
        if (err) {
          reject(err);
        }
        resolve({
          data: familyCommunityPoints && familyCommunityPoints.length > 0 ? familyCommunityPoints[0].data : [],
          total: familyCommunityPoints && familyCommunityPoints.length > 0 ? familyCommunityPoints[0].total : 0,
        });
      });
  });
}

module.exports.getAdjustmentPointForSpecificMonth = (query) => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.findOne(query).exec((err, familyCommunityPoints) => {
      if (err) {
        reject(err);
      }
      resolve(familyCommunityPoints);
    });
  });
}

module.exports.getCommunityPointsGroupedByFamilyIdForCSV = (query) => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup:
        {
          from: 'wallets',
          localField: 'family',
          foreignField: 'family',
          as: 'wallet'
        }
      },
      {
        $unwind: '$wallet'
      },
      {
        $group: {
          _id: { family: '$family' },
          count: { $sum: 1 },
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
        $project: {
          family: 1,
          results: 1,
          'wallet.totalCommunityPoints': 1,
          'wallet.remainingCommunityPoints': 1,
          'wallet.redeemedCommunityPoints': 1
        }
      },
      {
        $sort: {
          family: -1
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, familyCommunityPoints) => {
        if (err) {
          reject(err);
        }
        resolve(familyCommunityPoints);
      });
  });
}

module.exports.getAllCommunityPointsCSV = (query) => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.aggregate([
      {
        $match: query
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
        $lookup: {
          from: 'users',
          localField: 'family.familyAdmin',
          foreignField: '_id',
          as: 'familyAdmin'
        }
      },
      {
        $unwind: '$familyAdmin'
      },
      {
        $lookup: {
          from: 'communities',
          localField: 'community',
          foreignField: '_id',
          as: 'community'
        }
      },
      {
        $unwind: {
          path: '$community',
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $project: {
          'familyAdmin.family': 1,
          'familyAdmin.email': 1,
          'familyAdmin.username': 1,
          'familyAdmin._id': 1,
          'points': 1,
          'action': 1,
          'source': 1,
          'info': 1,
          'quantity': 1,
          'date': 1,
          'community.name': 1,
          'community._id': 1
        }
      },
      {
        $sort: {
          'date': -1,
          'familyAdmin._id': -1
        }
      }
    ]).exec((err, familyCommunityPoints) => {
      if (err) {
        reject(err);
      }
      resolve(familyCommunityPoints);
    });
  });
}

module.exports.getAllRedeemedCommunityPoints = () => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.find({ action: 'Redeem' }).populate('family community').exec((err, communityPoints) => {
      if (err) {
        reject(err);
      }
      resolve(communityPoints);
    });
  });
}

module.exports.deleteCommunityPoints = (query) => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.findOneAndRemove(query, (err, deletedCommunityPoints) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(deletedCommunityPoints);
      }
    });
  });
}
module.exports.getDuplicateAdjustedPoints = (query) => {
  return new Promise((resolve, reject) => {
    CommunityPointsSchema.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: { family: '$family' },
          count: { $sum: 1 },
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
        $project: {
          family: 1,
          results: 1,
          count: 1
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: {
          family: -1
        }
      },
    ])
      .allowDiskUse(true)
      .exec((err, familyCommunityPoints) => {
        if (err) {
          reject(err);
        }
        resolve(familyCommunityPoints);
      });
  });
}
