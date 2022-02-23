const Boom = require('boom');
const randomatic = require('randomatic');
const familyDB = require('./family-model');
const responseMessages = require('../utils/messages');
const userDB = require('../user/user-model');
const walletCtrl = require('../wallet/wallet-controller');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');

const addFamily = async (family) => {
  try {
    const familyData = { ...family };
    let uniqueCode;
    let alreadyFamilyExists = ['family'];
    while (alreadyFamilyExists.length >= 1) {
      alreadyFamilyExists = await familyDB.getFamilyByFamilyCode(uniqueCode);
      uniqueCode = `FS${randomatic('0', 9)}`;
    }
    familyData.familyCode = uniqueCode;
    const createdFamily = await familyDB.addFamily(familyData);
    return createdFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_ADDING_FAMILY, error);
  }
}

module.exports.addFamily = addFamily;

module.exports.updateFamily = async (updateData, familyId) => {
  try {
    const updatedFamily = await familyDB.updateFamily(updateData, familyId);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_UPDATING_FAMILY, error);
  }
}

module.exports.updateFamilyAdmin = async (updateData, familyId, currentAdminCognitoId) => {
  try {
    const currentAdmin = await userDB.getUserByCognitoId(currentAdminCognitoId, false);
    const family = await familyDB.getFamilyById(familyId);
    if (!family) {
      throw Boom.forbidden(responseMessages.family.FAMILY_NOT_FOUND);
    }
    if (currentAdmin._id.toString() !== family.familyAdmin._id.toString()) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    if (!family.familyMembers.includes(updateData.newAdmin)) {
      throw Boom.forbidden('User you specified as new admin doesnot exists in the family, please provide the valid member Id'); // #TODO
    }
    const familyUpdateData = {
      familyAdmin: updateData.newAdmin
    };
    const updatedFamily = await familyDB.updateFamily(familyUpdateData, familyId);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_UPDATING_FAMILY, error);
  }
}

module.exports.getFamilyById = async (familyId) => {
  try {
    const family = await familyDB.getFamilyById(familyId);
    return family;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_UPDATING_FAMILY, error);
  }
}

const leaveFamily = (body, familyId) => {
  return new Promise(async (resolve, reject) => { // eslint-disable-line
    try {
      const family = await familyDB.getFamilyById(familyId);
      const user = await userDB.findByMongoId(body.user);
      if (!family) {
        throw Boom.forbidden(responseMessages.family.FAMILY_NOT_FOUND);
      }
      if (body.user.toString() === family.familyAdmin._id.toString()) {
        let newAdmin;
        let check = false;
        const newFamilyMembers = [];
        if (family.familyMembers.length > 1) {
          for (let i = 0; i < family.familyMembers.length; i++) {
            if (!check && family.familyMembers[i]._id.toString() !== family.familyAdmin._id.toString()) {
              if (!check) {
                newAdmin = family.familyMembers[i]._id;
                check = true;
              }
              newFamilyMembers.push(family.familyMembers[i]._id);
            }
          }
        }
        const newAdminData = await userDB.findByMongoId(newAdmin);
        const familyUpdateData = {
          familyAdmin: newAdmin,
          familyMembers: newFamilyMembers,
          name: `${newAdminData.username}'s Family`
        };
        const updatedFamily = await familyDB.updateFamily(familyUpdateData, familyId);
        await createUserFamilyAndWallet(body.user, user.username, user.cognitoId);
        resolve(updatedFamily);
      }
      const newFamilyMembers = [];
      if (family.familyMembers.length > 1) {
        for (let i = 0; i < family.familyMembers.length; i++) {
          if (family.familyMembers[i]._id.toString() !== body.user._id.toString()) {
            newFamilyMembers.push(family.familyMembers[i]._id);
          }
        }
      }
      const familyUpdateData = {
        familyMembers: newFamilyMembers,
      };
      const updatedFamily = await familyDB.updateFamily(familyUpdateData, familyId);
      await createUserFamilyAndWallet(body.user, user.username, user.cognitoId);
      resolve(updatedFamily);
    } catch (error) {
      reject(Boom.forbidden(responseMessages.family.ERROR_UPDATING_FAMILY, error));
    }
  });
}

module.exports.leaveFamily = leaveFamily;

module.exports.deleteFamily = async (familyId) => {
  try {
    await familyDB.deleteFamily(familyId);
    return {
      message: responseMessages.family.SUCCESS_DELETE_Family
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_DELETING_FAMILY, error);
  }
}

module.exports.getAllFamilies = async () => {
  try {
    const allFamilies = await familyDB.getAllFamilies();
    return allFamilies;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_GETTING_ALL_FAMILIES, error);
  }
}

module.exports.getFamilyByFamilyCode = async (familyCode) => {
  try {
    const family = await familyDB.getFamilyByFamilyCode(familyCode);
    return family;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_GETTING_FAMILY_BY_CODE, error);
  }
}
const createUserFamilyAndWallet = async (user, username, cognitoId) => {
  try {
    const newWallet = await walletCtrl.createWallet(user);
    const newFamilyData = {
      name: `${username}'s Family`,
      familyAdmin: user,
      familyMembers: [user],
      wallet: newWallet._id
    };
    const newFamily = await addFamily(newFamilyData);
    await userDB.updateUserDetails({ wallet: newWallet._id, family: newFamily._id }, cognitoId);
    return;
  } catch (error) {
    throw Boom.forbidden('Error creating user new family and wallet');
  }
}

module.exports.createUserFamilyAndWallet = createUserFamilyAndWallet;

module.exports.updateFamilyData = async (updateData, familyId, cognitoId) => {
  try {
    const user = await userDB.getUserByCognitoId(cognitoId, false);
    const family = await familyDB.getFamilyById(familyId);
    if (family.familyAdmin._id.toString() !== user._id.toString()) {
      throw Boom.forbidden('Sorry, You have not enough rights to perform this action'); // TODO
    }
    const $promises = [];
    if (updateData.familyMembers && updateData.familyMembers.length < family.familyMembers.length) {
      // some one has been removed = require(that family
      for (let i = 0; i < family.familyMembers.length; i++) {
        let check = false;
        for (let j = 0; j < updateData.familyMembers.length; j++) {
          if (family.familyMembers[i]._id.toString() === updateData.familyMembers[j].toString()) {
            check = true;
            break;
          }
          if (!check) {
            $promises.push(leaveFamily({ user: family.familyMembers[i]._id }, familyId));
          }
        }
      }
      if ($promises.length > 0) {
        try {
          await Promise.all($promises);
        } catch (error) {
          console.log(error);
        }
      }
    }
    delete updateData.familyMembers;
    const updatedFamily = await familyDB.updateFamily(updateData, familyId);
    return updatedFamily;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_UPDATING_FAMILY, error);
  }
}

module.exports.getAllAccountDetails = async (query) => {
  try {
    const allFamilies = await familyDB.getAllAccountDetails(query);
    return allFamilies;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_GETTING_ACCOUNT_DETAILS, error);
  }
}

module.exports.getAllAccountDetailsCSV = async (query) => {
  try {
    let allFamiliesAccountDetails = await familyDB.getAllAccountDetailsForCSV(query);
    allFamiliesAccountDetails = allFamiliesAccountDetails.map(familyAccount => {
      return {
        ...familyAccount,
        '_id': familyAccount._id.toString(),
        'familyAdmin': {
          ...familyAccount.familyAdmin,
          _id: familyAccount.familyAdmin._id.toString()
        },
      }
    });
    const s3UploadData = await createAndUploadCsvToS3(allFamiliesAccountDetails, `family-accounts-csv/${Date.now()}/family-accounts.csv`);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.family.ERROR_GETTING_ACCOUNT_DETAILS, error);
  }
}
