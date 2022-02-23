const Boom = require('boom');
const inviteDB = require('./invite-model');
const responseMessages = require('../utils/messages');
const walletDB = require('../wallet/wallet-model');
const settingsDB = require('../settings/settings-model');
const userDB = require('../user/user-model');
const notificationDB = require('../notification/notification-model');
const walletTransactionDB = require('../wallet-transaction/wallet-transaction-model');

module.exports.createOrGetInvite = async (userId) => {
  try {
    const invite = await inviteDB.creteOrGetInvite(userId);
    return invite;
  } catch (error) {
    throw Boom.forbidden(responseMessages.invite.ERROR_CREATING_INVITE, error);
  }
}

module.exports.acceptInvite = async (acceptedBy, code, returnReferer, sendBonus) => {
  try {
    const user = await userDB.findByMongoId(acceptedBy);
    if (user.inviteBonusSent) {
      return {
        alreadyAccepted: true
      };
    }
    let data;
    if (!sendBonus) {
      data = await inviteDB.acceptInvite(acceptedBy, code);
    } else {
      data = await inviteDB.getInviteByCode(code);
      data = { updatedInvite: data };
    }
    const settings = await settingsDB.getSettings();
    const initiator = data.updatedInvite.initiator;
    const notificationData = {
      notificationType: 'Invite-Bonus',
      user: [initiator._id],
      sendToAllUsers: false,
      description: `Congratulation, Your friend ${user.username} has accepted your invite. You will be awarded soon as he/she upload his/her first receipt`,
      meta: {
        invite: data.updatedInvite._id
      }
    };
    if (sendBonus) {
      notificationData.description = `Congratulation, Your have been awarded with €${settings.inviteCreatorBonus} as your friend ${user.username} has uploaded his first receipt`;
    }
    await notificationDB.createNotification(notificationData);
    // add bonus point to invite creator
    if (sendBonus) {
      await walletDB.updateAmountToWallet(data.updatedInvite.initiator, settings.inviteCreatorBonus);
      await userDB.updateUserDetails({ inviteBonusSent: true }, user.cognitoId);
      const initiatorData = await userDB.findByMongoId(initiator._id);
      const walletTransaction = {
        dType: 'invite.create',
        description: 'Amount awarded on inviting others',
        meta: {
          invite: data._id
        },
        user: initiator._id,
        family: initiatorData.family,
        amount: settings.inviteCreatorBonus,
        isCredited: false
      }
      await walletTransactionDB.createWalletTransaction(walletTransaction);
    }

    if (returnReferer) {
      return data.updatedInvite.initiator._id;
    }
    return {
      message: responseMessages.invite.SUCCESS_ACCEPT_INVITE
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.invite.ERROR_ACCEPTING_INVITE, error);
  }
}
module.exports.validateInviteCode = async (code) => {
  try {
    const invite = await inviteDB.getInviteByCode(code);
    return invite;
  } catch (error) {
    throw Boom.forbidden(error);
  }
}

module.exports.getAllInvites = async () => {
  try {
    const invites = await inviteDB.getAllInvites();
    return invites;
  } catch (error) {
    throw Boom.forbidden(error);
  }
}
