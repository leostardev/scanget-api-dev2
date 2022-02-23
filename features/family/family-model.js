const FamilySchema = require('./family-schema');

module.exports.addFamily = (familyData) => {
  const family = new FamilySchema(familyData);
  return new Promise((resolve, reject) => {
    family.save((err, createdFamily) => {
      if (err) {
        reject(err);
      }
      resolve(createdFamily);
    });
  });
}

module.exports.updateFamily = (updateFamilyData, familyId) => {
  return new Promise((resolve, reject) => {
    FamilySchema.findOneAndUpdate({ _id: familyId }, updateFamilyData, { new: true }).populate('categories familyMembers familyAdmin').exec((err, updatedFamily) => {
      if (err) {
        reject(err);
      }
      updatedFamily = this.sortFamilyMembers(updatedFamily);
      resolve(updatedFamily);
    });
  });
}

module.exports.deleteFamily = (familyId) => {
  return new Promise((resolve, reject) => {
    FamilySchema.findById(familyId, (err) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        active: false
      };
      FamilySchema.findOneAndUpdate({ _id: familyId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        resolve({});
      });
    });
  });
}

module.exports.getAllFamilies = () => {
  return new Promise((resolve, reject) => {
    FamilySchema.find({ active: true }).exec((err, allFamilies) => {
      if (err) {
        reject(err);
      }
      resolve(allFamilies);
    });
  });
}

module.exports.getFamilyByFamilyCode = (familyCode) => {
  return new Promise((resolve, reject) => {
    FamilySchema.find({ familyCode, active: true }).exec((err, family) => {
      if (err) {
        reject(err);
      }
      resolve(family);
    });
  });
}

module.exports.getFamilyById = (familyId, dontPopulate) => {
  let populateString = '';
  if (!dontPopulate) {
    populateString = 'categories familyMembers familyAdmin accountDetails.donation';
  }
  return new Promise((resolve, reject) => {
    FamilySchema.findOne({ _id: familyId, active: true }).populate(populateString).lean().exec((err, family) => {
      if (err) {
        reject(err);
      }
      family = this.sortFamilyMembers(family);
      resolve(family);
    });
  });
}

module.exports.getFamilyByAdminId = (familyAdmin) => {
  return new Promise((resolve, reject) => {
    FamilySchema.find({ familyAdmin, active: true }).lean().exec((err, family) => {
      if (err) {
        reject(err);
      }
      resolve(family);
    });
  });
}

module.exports.updateFamilyCategories = (categories, familyId) => {
  return new Promise((resolve, reject) => {
    FamilySchema.findByIdAndUpdate(familyId, { categories }, { new: true }, (err2, updatedFamily) => { // eslint-disable-line
      if (err2) {
        return reject(err2);
      }
      resolve(updatedFamily);
    });
  });
}

module.exports.sortFamilyMembers = (family) => {
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

module.exports.getAllAccountDetails = (queryParams) => {
  const searchText = queryParams.search;
  const query = {
    active: true
  };
  let limit = parseInt(queryParams.limit || 30);
  let skip = parseInt(queryParams.skip || 0) * limit;
  let searchObj = {};
  if (queryParams.scope === 'no_iban') {
    searchObj = {
      $or: [
        {
          'accountDetails.iban_no': { $exists: false }
        },
        {
          'accountDetails.iban_no': { $eq: '' }
        }
      ]
    };
  } else if (searchText) {
    searchObj = {
      $or: [
        { 'accountDetails.iban_no': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    };
  }

  return new Promise((resolve, reject) => {
    FamilySchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'familyAdmin',
          foreignField: '_id',
          as: 'familyAdmin'
        }
      },
      {
        $unwind: '$familyAdmin'
      },
      {
        $match: searchObj
      },
      {
        $project: {
          '_id': 1,
          'familyAdmin._id': 1,
          'familyAdmin.username': 1,
          'familyAdmin.email': 1,
          'accountDetails': 1,
          'active': 1,
          'name': 1,
          'familyCode': 1
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
      .exec((err, allFamiliesAccountDetails) => {
        if (err) {
          reject(err);
        }
        resolve(allFamiliesAccountDetails && allFamiliesAccountDetails.length > 0 ? allFamiliesAccountDetails[0] : { total: 0, data: [] });
      });
  });
}

module.exports.getAllAccountDetailsForCSV = (queryParams) => {
  const searchText = queryParams.search;
  const query = {
    active: true
  };
  let searchObj = {};
  if (queryParams.scope === 'no_iban') {
    searchObj = {
      $or: [
        {
          'accountDetails.iban_no': { $exists: false }
        },
        {
          'accountDetails.iban_no': { $eq: '' }
        }
      ]
    };
  } else if (searchText) {
    searchObj = {
      $or: [
        { 'accountDetails.iban_no': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    };
  }

  return new Promise((resolve, reject) => {
    FamilySchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'familyAdmin',
          foreignField: '_id',
          as: 'familyAdmin'
        }
      },
      {
        $unwind: '$familyAdmin'
      },
      {
        $match: searchObj
      },
      {
        $project: {
          '_id': 1,
          'familyAdmin._id': 1,
          'familyAdmin.username': 1,
          'familyAdmin.email': 1,
          'accountDetails': 1,
          'active': 1,
          'name': 1,
          'familyCode': 1
        }
      }
    ])
      .exec((err, allFamiliesAccountDetails) => {
        if (err) {
          reject(err);
        }
        resolve(allFamiliesAccountDetails);
      });
  });
}
