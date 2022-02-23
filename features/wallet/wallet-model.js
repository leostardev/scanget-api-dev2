const moment = require('moment');
const WalletSchema = require('./wallet-schema');
const transactionSchema = require('../transaction/transaction-schema');
const UserSchema = require('../user/user-schema');
const CommunityPointsSchema = require('../community-points/community-points-schema');

module.exports.createWallet = data => {
  const receipt = new WalletSchema(data);
  return new Promise((resolve, reject) => {
    receipt.save((err, createdWallet) => {
      if (err) {
        reject(err);
      }
      resolve(createdWallet);
    });
  });
}

module.exports.getWalletByUserId = userId => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      WalletSchema.findOne({ family: user.family }).populate({ path: 'transactions', model: transactionSchema }).exec((err2, userWallet) => {
        if (err2) {
          reject(err2);
        }
        resolve(userWallet);
      });
    });
  });
}

module.exports.updateAmountToWallet = (userId, balance) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      console.log(`Adding euro ${balance} to family wallet with family Id ${user.family}`)
      WalletSchema.findOneAndUpdate({ family: user.family }, { $inc: { balance } }, { new: true }, (err2, userWallet) => {
        if (err2) {
          reject(err2);
        }
        console.log('Updated Wallet', userWallet);
        resolve(userWallet);
      });
    });
  });
}

module.exports.updateAmountOnReceiptApproved = (userId, amountSpent, balance) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      console.log(`Adding euro ${balance} to family wallet and euro ${amountSpent} to amountSpent with family Id ${user.family} on receipt approved`)
      WalletSchema.findOneAndUpdate({ family: user.family }, { $inc: { amountSpent, balance, savedAmount: balance } }, { new: true }, (err2, userWallet) => {
        if (err2) {
          reject(err2);
        }
        console.log('Updated Wallet', userWallet);
        resolve(userWallet);
      });
    });
  });
}

module.exports.updateAmountOnReceiptRevertFromAccepted = (userId, amountSpent, balance, communityPoints) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      console.log(`Subtracting euro ${balance} from family wallet and euro ${amountSpent} from amountSpent with family Id ${user.family} on receipt revert from accepted. Also deducting ${communityPoints} community points from wallet`)
      WalletSchema.findOneAndUpdate({ family: user.family }, { $inc: { amountSpent: amountSpent * -1, balance: balance * -1, savedAmount: balance * -1, totalCommunityPoints: communityPoints * -1, remainingCommunityPoints: communityPoints * -1 } }, { new: true }, (err2, userWallet) => {
        if (err2) {
          reject(err2);
        }
        console.log('Updated Wallet', userWallet);
        resolve(userWallet);
      });
    });
  });
}

module.exports.updateAmountToWalletByUserId = (userId, balance, savedAmount) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      console.log(`Adding euro ${balance} to family wallet and euro ${savedAmount} to savedAmount with user Id ${userId}`)
      WalletSchema.findOneAndUpdate({ family: user.family }, { $inc: { balance, savedAmount } }, { new: true }, (err2, userWallet) => {
        if (err2) {
          reject(err2);
        }
        console.log('Updated Wallet', userWallet);
        resolve(userWallet);
      });
    });
  });
}
module.exports.addTransactionToUserWallet = (userId, transaction) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        reject(err);
      }
      WalletSchema.findOneAndUpdate({ family: user.family }, { $push: { transactions: transaction } }, { new: true }, (err2, updatedWalltet) => {
        if (err2) {
          reject(err2);
        }
        resolve(updatedWalltet);
      });
    });
  });
}

module.exports.attachFamilyToWallet = (walletId, family) => {
  return new Promise((resolve, reject) => {
    WalletSchema.findByIdAndUpdate(walletId, { family }, { new: true }, (err, updatedWalltet) => {
      if (err) {
        reject(err);
      }
      resolve(updatedWalltet);
    });
  });
}

module.exports.getWalletByFamilyId = family => {
  return new Promise((resolve, reject) => {
    WalletSchema.findOne({ family }, (err, wallet) => {
      if (err) {
        reject(err);
      }
      resolve(wallet);
    });
  });
}

module.exports.addAmountToWalletOnInviteAccept = (walletId, amount) => {
  return new Promise((resolve, reject) => {
    console.log(`Adding euro ${amount} to family wallet with wallet Id ${walletId} on invite accept`)
    WalletSchema.findByIdAndUpdate(walletId, { $inc: { balance: amount } }, { new: true }, (err, wallet) => {
      if (err) {
        reject(err);
      }
      console.log('Updated Wallet', wallet);
      resolve(wallet);
    });
  });
}

module.exports.updateOutstandingBalanceOnSuccessfulPayment = (walletId, amount) => {
  return new Promise((resolve, reject) => {
    console.log(`Subtracting euro ${amount} from to family wallet with Id ${walletId} on successful payment`)
    WalletSchema.findByIdAndUpdate(walletId, { $inc: { balance: amount * -1 } }, { new: true }, (err, wallet) => {
      if (err) {
        reject(err);
      }
      console.log('Updated Wallet', wallet);
      resolve(wallet);
    });
  });
}

module.exports.submitPointsInFamilyWallet = (family, points) => {
  return new Promise((resolve, reject) => {
    console.log(`Adding ${points} points to family wallet with family Id ${family}`)
    WalletSchema.findOneAndUpdate({ family }, { $inc: { totalCommunityPoints: points, remainingCommunityPoints: points } }, { new: true }, (err, wallet) => {
      if (err) {
        reject(err);
      }
      console.log('Updated Wallet', wallet);
      resolve(wallet);
    });
  });
}

module.exports.redeemPointsPointsFromFamilyWallet = (family, points, amount) => {
  return new Promise((resolve, reject) => {
    console.log(`Redeeming ${points * -1} from family wallet with Id ${family} and adding euro ${amount}`)
    WalletSchema.findOneAndUpdate({ family }, { $inc: { balance: amount, savedAmount: amount, redeemedCommunityPoints: points, remainingCommunityPoints: points * -1 } }, { new: true }, (err, wallet) => {
      if (err) {
        reject(err);
      }
      console.log('Updated Wallet', wallet);
      resolve(wallet);
    });
  });
}

module.exports.submitPointsInFamilyWalletByUserIdAndAddTransaction = (userId, points, source, info, community) => {
  return new Promise((resolve, reject) => {
    UserSchema.findById(userId, (err, user) => {
      if (err) {
        return reject(err);
      }
      if (!user) {
        console.log(`Failed to add ${points} points to family wallet with user Id ${userId} bacause no user found with this Id`)
      }
      if (!user.family) {
        console.log(`Failed to add ${points} points to family wallet with user Id ${userId} bacause family found with this user Id`)
        return resolve()
      }
      console.log(`Adding ${points} points to family wallet with family Id ${user.family}`)
      WalletSchema.findOneAndUpdate({ family: user.family }, { $inc: { totalCommunityPoints: points, remainingCommunityPoints: points } }, { new: true }, (err2, wallet) => {
        if (err2) {
          return reject(err2);
        }
        console.log(`Updated Wallet Points: totalCommunityPoints=${wallet.totalCommunityPoints} remainingCommunityPoints=${wallet.remainingCommunityPoints} `);
        const communityPoints = {
          family: user.family,
          points: points,
          action: 'Manual-add',
          source,
          info,
          quantity: 1,
          date: moment(new Date()).utc().toDate()
        };
        if (community) {
          communityPoints.community = community;
        }
        CommunityPointsSchema.create(communityPoints, (err3) => {
          if (err3) {
            return reject(err3)
          }
          return resolve(wallet);
        })
      });
    });
  });
}
