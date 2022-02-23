/* eslint-disable require-atomic-updates */
/* eslint-disable consistent-return */
const R = require('ramda');
// const Boom = require('boom');
const Jimp = require('jimp');
const config = require('../../config');
const moment = require('moment');
const UserSchema = require('./user-schema');
const categorySchema = require('../category/category-schema'); // eslint-disable-line
const walletSchema = require('../wallet/wallet-schema');
const dealSchema = require('../deal/deal-schema'); // eslint-disable-line
const familySchema = require('../family/family-schema');
const periodSchema = require('../period/period-schema');

const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: config.aws.region,
});

const attribNameMapper = (origin, inversed) => {
  // eslint-disable-line
  const mapping = {
    'sub': 'cognitoId', // eslint-disable-line
    'preferred_username': 'username', // eslint-disable-line
    'custom:role': 'role'
  };

  if (inversed) {
    const nMapping = R.invertObj(mapping);
    return nMapping[origin] || origin;
  }

  return mapping[origin] || origin;
}

module.exports.fetchRandom = () => {
  return new Promise((resolve, reject) => {
    UserSchema.findOne().exec((err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
}

module.exports.getByUserId = (id, noFamily) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(id).populate('favoriteDeals').lean().exec((err, user) => {
      if (err) {
        reject(err);
      }
      if (noFamily) {
        return resolve(user);
      }
      familySchema.findById(user.family).populate('categories').exec((err2, family) => {
        if (err2) {
          reject(err2);
        }
        user.categories = family.categories;
        user.family = family._id;
        resolve(user);
      });
    });
  });
}

module.exports.updateAttributes = (cognitoUserName, attributes, userPoolId) => {
  const params = {
    UserPoolId: userPoolId || config.cognitoPoolId,
    Username: cognitoUserName,
    UserAttributes: R.compose(
      R.map((attribName) => ({ // eslint-disable-line
        Name: attribNameMapper(attribName, true),
        Value: attributes[attribName],
      })),
      R.keys
    )(attributes),
  };
  return cognito.adminUpdateUserAttributes(params).promise();
}

const extractAttribFromCognitoUser = (cognitoUser, attributesKey = 'UserAttributes') => {
  if (!cognitoUser[attributesKey] || !Array.isArray(cognitoUser[attributesKey])) {
    return cognitoUser;
  }

  const plainObjAttribs = cognitoUser[attributesKey].reduce((container, attr) => {
    const key = attribNameMapper(attr.Name);
    container[key] = attr.Value;  // eslint-disable-line
    return container;
  }, {});

  return {
    ...plainObjAttribs,
    _meta: R.omit(attributesKey, cognitoUser)
  };
}

module.exports.changePassword = params => {
  return cognito.changePassword(params).promise();
}

module.exports.getByCognitoUsername = (cognitoUserName, userPoolId) => {
  const params = {
    UserPoolId: userPoolId || config.cognitoPoolId,
    Username: cognitoUserName
  };

  return cognito
    .adminGetUser(params)
    .promise()
    .then(extractAttribFromCognitoUser);
}

module.exports.createUser = userData => {
  const user = new UserSchema(userData);
  return new Promise((resolve, reject) => {
    user.save((err, newUser) => {
      if (err) {
        reject(err);
      }
      resolve(newUser);
    });
  });
}

module.exports.fetchByAttribute = async (attribName, attribValue, userPoolId) => {
  // Note that you can't search for custom attributes
  const params = {
    UserPoolId: userPoolId || config.cognitoPoolId,
    Filter: `${attribName} = "${attribValue}"`
  };
  const info = await cognito
    .listUsers(params)
    .promise()
    .then(data => data.Users.map(user => extractAttribFromCognitoUser(user, 'Attributes')));
  return info;
}

module.exports.getUserByCognitoId = (cognitoId, populate = true) => {
  return new Promise((resolve, reject) => {
    const query = { cognitoId };
    UserSchema.findOne(query).deepPopulate('favoriteDeals.category family.categories favoriteDeals.periods family.familyMembers family.familyAdmin client family.accountDetails.donation').lean().exec((err, userData) => {
      if (err) {
        reject(err);
      }
      if (!userData) {
        reject(new Error('Something went wrong while getting your details, kindly contact support to resolve this issue'));
      }
      if (userData && userData.family && userData.family.categories) {
        userData.categories = userData.family.categories;
      }
      if (userData && userData.family && userData.family.familyAdmin) {
        userData.family = sortFamilyMembers(userData.family);
        if (userData._id.toString() === userData.family.familyAdmin._id.toString()) {
          userData.family.isAdmin = true;
        } else {
          userData.family.isAdmin = false;
        }
      } else if (userData.family) {
        userData.family.isAdmin = false;
      }
      if (userData && userData.favoriteDeals.length > 0 && populate) {
        const currentDate = new Date();
        periodSchema.findOne({
          startDate: {
            $lte: currentDate
          },
          endDate: {
            $gte: currentDate
          }
        }, (err2, period) => {
          if (err2) {
            reject(err2);
          }
          const favoriteDealsCount = userData.favoriteDeals.length;
          userData.favoriteDeals = userData.favoriteDeals.filter(deal => {
            // const currentDate = new Date();
            // const dealStartDate = new Date(deal.startDate);
            // const dealEndDate = new Date(deal.endDate);
            // if (dealStartDate.getTime() <= currentDate.getTime() && dealEndDate.getTime() >= currentDate.getTime()) {
            //   return true;
            // }
            for (let i = 0; i < deal.periods.length; i++) {
              if (period && deal.periods[i].description === period.description) {
                return true;
              }
            }
            return false;
          });
          if (favoriteDealsCount > userData.favoriteDeals.length) { // check if some deals are expired
            const activeDeals = userData.favoriteDeals.map(deal => deal._id);
            UserSchema.findByIdAndUpdate(userData._id, { favoriteDeals: activeDeals }, err3 => {
              if (err3) {
                console.log(err);
                reject(err);
              } else {
                userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
                  let thumbnail = item.thumbnail;
                  if (!thumbnail) {
                    thumbnail = item.image.replace('deal', 'deal-thumbnails');
                  }
                  return { ...item, isFavourite: true, thumbnail };
                });
                resolve(userData);
              }
            });
          } else {
            userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
              return { ...item, isFavourite: true };
            });
            resolve(userData);
          }
          userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
            return { ...item, isFavourite: true };
          });
        });
      } else {
        resolve(userData);
      }
    });
  });
}

module.exports.updateUserDetails = (updateData, cognitoId) => {
  return new Promise((resolve, reject) => {
    UserSchema.findOneAndUpdate({ cognitoId }, updateData, { new: true }).populate('family wallet').lean().exec((err, updatedUser) => {
      if (err) {
        reject(err);
      }
      resolve(updatedUser);
    });
  });
}

module.exports.deactivateMongoAccount = cognitoId => {
  return new Promise((resolve, reject) => {
    UserSchema.findOneAndUpdate({ cognitoId }, { deactivated: true }, { new: true }, (err, updatedUser) => {
      if (err) {
        reject(err);
      }
      resolve(updatedUser);
    });
  });
}

module.exports.activateMongoAccount = cognitoId => {
  return new Promise((resolve, reject) => {
    UserSchema.findOneAndUpdate({ cognitoId }, { deactivated: false }, { new: true }, (err, updatedUser) => {
      if (err) {
        reject(err);
      }
      resolve(updatedUser);
    });
  });
}

module.exports.addDealToUserFavorites = (dealId, userId) => {
  return new Promise((resolve, reject) => {
    UserSchema.findOne({ _id: userId }, (err, user) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      if (user.favoriteDeals && user.favoriteDeals.includes(dealId.toString())) {
        return resolve(user);
      }
      const favoriteDeals = user.favoriteDeals;
      favoriteDeals.push(dealId);
      UserSchema.findOneAndUpdate({ _id: userId }, { $set: { favoriteDeals } }, { new: true }, (err2, updatedUser) => { // eslint-disable-line
        if (err2) {
          return reject(err2);
        }
        resolve(updatedUser);
      });
    });
  });
}

module.exports.removeDealFromFavorite = (dealId, userId) => {
  return new Promise((resolve, reject) => {
    UserSchema.findOne({ _id: userId }, (err, user) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      if (user.favoriteDeals && user.favoriteDeals.length === 0) {
        return resolve(user);
      }
      const favoriteDeals = user.favoriteDeals;
      const index = favoriteDeals.indexOf(dealId.toString());
      if (index !== -1) {
        favoriteDeals.splice(index, 1);
      }
      UserSchema.findOneAndUpdate({ _id: userId }, { $set: { favoriteDeals } }, { new: true }, (err2, updatedUser) => { // eslint-disable-line
        if (err2) {
          return reject(err2);
        }
        resolve(updatedUser);
      });
    });
  });
}

// addToMyCategories(category, userId) {
//   return new Promise((resolve, reject) => {
//     UserSchema.findOne({ _id: userId }, (err, user) => { // eslint-disable-line
//       if (err) {
//         return reject(err);
//       }
//       if (user.categories && user.categories.includes(category.toString())) {
//         return resolve(user);
//       }
//       const categories = user.categories;
//       categories.push(category);
//       UserSchema.findOneAndUpdate({ _id: userId }, { $set: { categories } }, { new: true }, (err2, updatedUser) => { // eslint-disable-line
//         if (err2) {
//           return reject(err2);
//         }
//         resolve(updatedUser);
//       });
//     });
//   });
// }

// removeFromMyCategories(category, userId) {
//   return new Promise((resolve, reject) => {
//     UserSchema.findOne({ _id: userId }, (err, user) => { // eslint-disable-line
//       if (err) {
//         return reject(err);
//       }
//       if (user.categories && user.categories.length === 0) {
//         return resolve(user);
//       }
//       const categories = user.categories;
//       const index = categories.indexOf(category.toString());
//       if (index !== -1) {
//         categories.splice(index, 1);
//       }
//       UserSchema.findOneAndUpdate({ _id: userId }, { $set: { categories } }, { new: true }, (err2, updatedUser) => { // eslint-disable-line
//         if (err2) {
//           return reject(err2);
//         }
//         resolve(updatedUser);
//       });
//     });
//   });
// }

module.exports.findByMongoId = userId => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject('Not Found');
      }
      resolve(user);
    });
  });
}

module.exports.getAllUsers = queryParams => {
  const searchText = queryParams.search;
  const limit = parseInt(queryParams.limit || 50);
  const skip = parseInt((queryParams.skip || 0) * limit);

  const query = {
    $and: [{
      role: 'user'
    }]
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query['$and'][0].createdAt = {
      $gte: queryParams.minDate,
      $lte: queryParams.maxDate
    };
  }
  if (searchText) {
    query['$and'].push({
      $or: [
        { 'username': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'email': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'phone': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    })
  }
  if (queryParams.user && queryParams.user !== '') {
    query['$and'].push({
      _id: queryParams.user
    });
  }
  if (queryParams.family && queryParams.family !== '') {
    query['$and'].push({
      family: queryParams.family
    });
  }
  if (queryParams.wallet && queryParams.wallet !== '') {
    query['$and'].push({
      wallet: queryParams.wallet
    });
  }
  return new Promise((resolve, reject) => {
    UserSchema.find(query, '_id username location phone email wallet family createdAt deactivated lastLogin cognitoId').sort({ createdAt: -1 }).populate({ path: 'wallet', model: walletSchema }).skip(skip).limit(limit).exec((err, users) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject(err);
      }
      UserSchema.count(query, (err2, count) => {
        if (err2) {
          reject(err2)
        }
        resolve({
          allUsers: users,
          totalCount: count
        });
      })
    });
  });
}

module.exports.getAllUsersForCSV = queryParams => {
  const searchText = queryParams.search;

  const query = {
    $and: [{
      role: 'user'
    }]
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query['$and'][0].createdAt = {
      $gte: queryParams.minDate,
      $lte: queryParams.maxDate
    };
  }
  if (searchText) {
    query['$and'].push({
      $or: [
        { 'username': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'email': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'phone': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    })
  }
  if (queryParams.user && queryParams.user !== '') {
    query['$and'].push({
      _id: queryParams.user
    });
  }
  if (queryParams.family && queryParams.family !== '') {
    query['$and'].push({
      family: queryParams.family
    });
  }
  if (queryParams.wallet && queryParams.wallet !== '') {
    query['$and'].push({
      wallet: queryParams.wallet
    });
  }
  return new Promise((resolve, reject) => {
    UserSchema.find(query).sort({ createdAt: -1 }).populate({ path: 'wallet', model: walletSchema }).exec((err, users) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject(err);
      }
      resolve(users);
    });
  });
}

module.exports.getAllAdmins = () => {
  return new Promise((resolve, reject) => {
    UserSchema.find({ role: 'admin' }, (err, admins) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        console.log(err);
        return reject(err);
      }
      resolve(admins);
    });
  });
}

const sortFamilyMembers = family => {
  const familyAdmin = family.familyAdmin;
  let sortedMembers = [];
  for (let i = 0; i < family.familyMembers.length; i++) {
    if (family.familyMembers[i]._id.toString() === familyAdmin._id.toString()) {
      sortedMembers.push(family.familyMembers[i]);
      break;
    }
  }
  sortedMembers = [...sortedMembers, ...family.familyMembers.filter(member => member._id.toString() !== familyAdmin._id.toString())];
  family.familyMembers = sortedMembers;
  return family;
}

module.exports.sortFamilyMembers = sortFamilyMembers;

module.exports.getUsersFavoriteDeals = user => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(user).deepPopulate('favoriteDeals.category favoriteDeals.periods').lean().exec((err, userData) => {
      if (err) {
        reject(err);
      }
      if (!userData) {
        reject(new Error('Something went wrong while getting your details, kindly contact support to resolve this issue'));
      }

      if (userData && userData.favoriteDeals.length > 0) {
        const currentDate = new Date();
        periodSchema.findOne({
          startDate: {
            $lte: currentDate
          },
          endDate: {
            $gte: currentDate
          }
        }, (err2, period) => {
          if (err2) {
            reject(err2);
          }

          const favoriteDealsCount = userData.favoriteDeals.length;
          userData.favoriteDeals = userData.favoriteDeals.filter(deal => {
            // const dealStartDate = new Date(deal.startDate);
            // const dealEndDate = new Date(deal.endDate);
            // if (dealStartDate.getTime() <= currentDate.getTime() && dealEndDate.getTime() >= currentDate.getTime()) {
            //   return true;
            // }
            for (let i = 0; i < deal.periods.length; i++) {
              if (period && deal.periods[i].description === period.description) {
                return true;
              }
            }
            return false;
          });
          if (favoriteDealsCount > userData.favoriteDeals.length) { // check if some deals are expired
            const activeDeals = userData.favoriteDeals.map(deal => deal._id);
            UserSchema.findByIdAndUpdate(userData._id, { favoriteDeals: activeDeals }, err3 => {
              if (err3) {
                reject(err);
              } else {
                userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
                  let thumbnail = item.thumbnail;
                  if (!thumbnail) {
                    thumbnail = item.image.replace('deal', 'deal-thumbnails');
                  }
                  return { ...item, isFavourite: true, thumbnail };
                });
                resolve(userData.favoriteDeals);
              }
            });
          } else {
            userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
              let thumbnail = item.thumbnail;
              if (!thumbnail) {
                thumbnail = item.image.replace('deal', 'deal-thumbnails');
              }
              return { ...item, isFavourite: true, thumbnail };
            });
            resolve(userData.favoriteDeals);
          }
          userData.favoriteDeals = userData.favoriteDeals.map((item) => { //eslint-disable-line
            let thumbnail = item.thumbnail;
            if (!thumbnail) {
              thumbnail = item.image.replace('deal', 'deal-thumbnails');
            }
            return { ...item, isFavourite: true, thumbnail };
          });
        });
      } else {
        resolve(userData.favoriteDeals);
      }
    });
  });
}

module.exports.getSpecificUserIdsForPushNotification = users => {
  const query = {
    _id: { $in: users },
    deactivated: false,
    pushNotifications: true,
    'pushIds.0': { $exists: true }
  };
  return new Promise((resolve, reject) => {
    UserSchema.find(query, (err, users) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      let pushIds = [];
      for (let i = 0; i < users.length; i++) {
        pushIds = [...pushIds, ...users[i].pushIds];
      }
      resolve(pushIds);
    });
  });
}

module.exports.getAllUserIdsForPushNotification = () => {
  const query = {
    deactivated: false,
    pushNotifications: true,
    'pushIds.1': { $exists: true }
  };
  return new Promise((resolve, reject) => {
    UserSchema.find(query, (err, users) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      let pushIds = [];
      for (let i = 0; i < users.length; i++) {
        pushIds = [...pushIds, ...users[i].pushIds];
      }
      resolve(pushIds);
    });
  });
}

module.exports.getTotalUsersCount = queryParams => {
  const query = {
    deactivated: false,
    role: 'user'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    UserSchema.count(query, (err, userCount) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject(err);
      }
      resolve(userCount);
    });
  });
}

module.exports.getTotalUsersStartingCount = minDate => {
  const query = {
    deactivated: false,
    role: 'user',
    createdAt: {
      $lte: moment(new Date(minDate)).utc().startOf('day').toDate()
    }
  };
  return new Promise((resolve, reject) => {
    UserSchema.count(query, (err, userCount) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject(err);
      }
      resolve(userCount);
    });
  });
}

module.exports.getActiveUsersCount = queryParams => {
  const query = {
    deactivated: false,
    role: 'user'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.lastLogin = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      // $lte: moment(new Date(queryParams.maxDate)).endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    UserSchema.count(query, (err, userCount) => { // eslint-disable-line
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject(err);
      }
      resolve(userCount);
    });
  });
}
// $promises.push(userDB.getTotalFamiliesCount(body));
// $promises.push(userDB.getActiveFamiliesCount(body));
module.exports.getTotalFamiliesCount = queryParams => {
  const query = {
    deactivated: false,
    role: 'user'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(queryParams.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    UserSchema.aggregate([
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
    ])
      .allowDiskUse(true)
      .exec((err, familiesCount) => { // eslint-disable-line
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject(err);
        }
        resolve(familiesCount.length);
      });
  });
}

module.exports.getTotalFamiliesStartingCount = minDate => {
  const query = {
    deactivated: false,
    role: 'user',
    createdAt: {
      $lte: moment(new Date(minDate)).utc().startOf('day').toDate()
    }
  };

  return new Promise((resolve, reject) => {
    UserSchema.aggregate([
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
    ])
      .allowDiskUse(true)
      .exec((err, familiesCount) => { // eslint-disable-line
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject(err);
        }
        resolve(familiesCount.length);
      });
  });
}

module.exports.getActiveFamiliesCount = queryParams => {
  const query = {
    deactivated: false,
    role: 'user'
  };
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.lastLogin = {
      $gte: moment(new Date(queryParams.minDate)).utc().startOf('day').toDate(),
      // $lte: moment(new Date(queryParams.maxDate)).endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    UserSchema.aggregate([
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
    ])
      .allowDiskUse(true)
      .exec((err, familiesCount) => { // eslint-disable-line
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject(err);
        }
        resolve(familiesCount.length);
      });
  });
}

module.exports.userRegisterationTrend = body => {
  return new Promise(async (resolve, reject) => {
    try {
      let totalCount = 0;
      const resultInTotal = true;
      if (resultInTotal) {
        totalCount = await UserSchema.count();
      }
      const dateRange = [];
      let startDate = new Date(moment(body.minDate).utc().format('YYYY-MM-DD')).getTime();
      const endDate = new Date(moment(body.maxDate).utc().format('YYYY-MM-DD')).getTime();
      // create an array of timestamp ranges
      while (startDate <= endDate) {
        dateRange.push(startDate);
        startDate += 8.64e+7;
      }
      const query = {
        createdAt: { $gte: moment(body.minDate).toDate() }
      };
      // aggregate mongoDB data by querying w.r.t 'registeredOn' and group it based on timestamps
      UserSchema.aggregate([
        {
          $match: query
        },
        {
          $project:
          {
            queryDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          }
        },
        {
          $group: {
            _id: { createdAt: '$queryDate' },
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            registeredOn: '$_id.createdAt'
          }
        },
        {
          $sort: {
            registeredOn: 1
          }
        },
        {
          $project: {
            _id: false,
            count: 1,
            timestamp: {
              $toLong: {
                $dateFromString: {
                  dateString: '$registeredOn'
                }
              }
            }
          }
        }
        // https://stackoverflow.com/questions/49731489/group-by-date-in-mongodb
        // https://docs.mongodb.com/manual/reference/operator/aggregation/count/
      ])
        .allowDiskUse(true)
        .exec((err, usersByDay) => {
          if (err) {
            return reject(err);
          }
          console.log(usersByDay);
          // if a previously fetched timestamp = require(mongoDB is found in the dateRange, push it alongwith the count; else, push the timestamp = require(dateRange with a count zero
          const userStats = [];
          let totalUsersInRange = 0;
          let totalUserAtPoint = 0;
          if (resultInTotal) {
            totalUsersInRange = usersByDay.map(item => item.count).reduce((a, b) => a + b, 0); // First Get total Users in Range :A
            totalUserAtPoint = totalCount - totalUsersInRange; // we minus the total users in range = require(total users to get the first starting point :A
          }
          // eslint-disable-next-line guard-for-in
          for (const day in dateRange) {
            let timestampFound = false;
            for (const user in usersByDay) {
              if (usersByDay[user].timestamp === dateRange[day]) {
                // add ```new Date(users[user].timestamp)``` in the following userStats.push() and add ```new Date(dateRange[day])``` at REF#1 to verify that data is sorted by timestamps
                if (resultInTotal) {
                  totalUserAtPoint += usersByDay[user].count; // Add in the count if the number of users has incremented at that day :A
                  userStats.push([moment(usersByDay[user].timestamp).format('DD MMM, YY'), totalUserAtPoint]);
                } else {
                  userStats.push([moment(usersByDay[user].timestamp).format('DD MMM, YY'), usersByDay[user].count]);
                }
                timestampFound = true;
                break;
              }
            }
            if (timestampFound === false) {
              // REF#1: add ```new Date(dateRange[day])``` in the following userStats.push() to verfiy that data is sorted by timestamps
              if (resultInTotal) {
                userStats.push([moment(dateRange[day]).format('DD MMM, YY'), totalUserAtPoint]);
              } else {
                userStats.push([moment(dateRange[day]).format('DD MMM, YY'), 0]);
              }
            }
          }
          resolve(userStats);
        });
    } catch (error) {
      return reject(error);
    }
  });
}

const s3Upload = (data) => {
  const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'eu-west-1' });
  return new Promise((resolve, reject) => {
    s3.putObject(data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    });
  })
}

module.exports.uploadImageToS3 = (body) => {
  let { rotate, thumbnailKey } = body;
  return new Promise(async (resolve, reject) => {
    try {

      const imageBuffer = new Buffer(body.imageData, 'base64');
      const updateData = {
        Body: imageBuffer,
        Bucket: body.bucket,
        ContentEncoding: body.contentEncoding,
        ContentType: body.contentType,
        Key: body.key,
        Metadata: {
          'image-fixed': 'true',
        }
      }

      if (rotate) {
        const jimpImageData = await Jimp.read(updateData.Body);
        const rotatedImage = await jimpImageData.rotate(-90).getBufferAsync(Jimp.MIME_JPEG);
        updateData.Body = rotatedImage;
      }
      const $promises = [];
      $promises.push(s3Upload(updateData));
      if (thumbnailKey) {
        const jimpThumbnailData = await Jimp.read(imageBuffer);
        let resizedImage;

        if (rotate) {
          resizedImage = await jimpThumbnailData.rotate(-90).resize(200, 200).getBufferAsync(Jimp.MIME_JPEG);
        } else {
          resizedImage = await jimpThumbnailData.resize(200, 200).getBufferAsync(Jimp.MIME_JPEG);
        }
        const thumbnailData = {
          Body: resizedImage,
          Bucket: body.bucket,
          ContentEncoding: body.contentEncoding,
          ContentType: body.contentType,
          Key: thumbnailKey,
          Metadata: {
            'image-fixed': 'true',
          }
        }
        $promises.push(s3Upload(thumbnailData));
      }

      await Promise.all($promises);
      resolve({
        Key: body.key
      });
    } catch (error) {
      reject(error);
    }
    // s3.putObject(updateData, async (err) => {
    //   if (err) {
    //     return reject(Boom.expectationFailed('Error uploading image', err));
    //   } else {
    //     if (thumbnailKey) {
    //       const jimpThumbnailData = await Jimp.read(imageBuffer);
    //       let resizedImage;
    //       if (rotate) {
    //         resizedImage = await jimpThumbnailData.rotate(-90).resize(200, 200).getBufferAsync(Jimp.MIME_JPEG);
    //       } else {
    //         resizedImage = await jimpThumbnailData.resize(200, 200).getBufferAsync(Jimp.MIME_JPEG);
    //       }
    //       updateData.Body = resizedImage;
    //       updateData.Key = thumbnailKey;
    //       s3.putObject(updateData, (err) => {
    //         if (err) {
    //           console.log('Error uploading data: ', updateData);
    //           return reject(Boom.expectationFailed('Error uploading image', err));
    //         } else {
    //           return resolve({
    //             Key: body.key
    //           });
    //         }
    //       });
    //     } else {
    //       resolve({
    //         Key: body.key
    //       });
    //     }
    //   }
    // });
  });
};

module.exports.getActiveUsersCountWrtReceipts = (dateQuery, queryParams) => {
  const searchText = queryParams.search;
  let limit = parseInt(queryParams.limit || 50);
  let skip = parseInt((queryParams.skip || 0) * limit);

  const query = {
    $and: [{
      role: 'user',
      deactivated: false
    }]
  };

  if (searchText) {
    query['$and'].push({
      $or: [
        { 'username': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'email': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'phone': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    })
  }

  let receiptsQuery = {};
  if (dateQuery && dateQuery.minDate && dateQuery.maxDate) {
    receiptsQuery = {
      $gte: moment(new Date(dateQuery.minDate)).utc().startOf('day').toDate(),
      $lte: moment(new Date(dateQuery.maxDate)).utc().endOf('day').toDate()
    };
  }
  return new Promise((resolve, reject) => {
    UserSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'receipts',
          localField: '_id',
          foreignField: 'user',
          as: 'receipts'
        }
      },
      {
        $unwind: '$receipts'
      },
      {
        $sort: { username: -1 }
      },
      {
        $match: {
          'receipts.createdAt': receiptsQuery
        }
      },
      {
        $group: {
          _id: { username: '$username', email: '$email', user: '$_id' },
          totalReceipts: { $sum: 1 },
          // results: { $addToSet: '$$ROOT' }
        }
      },
      {
        $addFields: {
          user: '$_id.user',
          username: '$_id.username',
          email: '$_id.email'
        }
      },
      {
        $project: {
          _id: false,
          username: 1,
          email: 1,
          user: 1,
          totalReceipts: 1
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
      .exec((err, usersWithReceipts) => { // eslint-disable-line
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject(err);
        }
        resolve(usersWithReceipts && usersWithReceipts.length > 0 ? usersWithReceipts[0] : { total: 0, data: [] });
      });
  });
}

module.exports.getUserByFamilyId = (family) => {
  return new Promise((resolve, reject) => {
    UserSchema.findOne({ family }, '_id email username wallet.totalCommunityPoints wallet.remainingCommunityPoints wallet.redeemedCommunityPoints').populate('wallet').lean().exec((err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
}
