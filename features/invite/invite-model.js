const Boom = require('boom');
const randomatic = require('randomatic');
const InviteSchema = require('./invite-schema');
const responseMessages = require('../utils/messages');

module.exports.creteOrGetInvite = (userId) => {
  return new Promise((resolve, reject) => {
    const params = {
      initiator: userId,
      active: true
    };

    InviteSchema.findOne(params, (err, invite) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      if (invite) {
        return resolve(invite);
      }
      params.availedBy = [];
      params.code = `SG${randomatic('0', 9)}`;
      const newInvite = new InviteSchema(params);
      newInvite.save((err2, createdInvite) => { // eslint-disable-line
        if (err2) {
          return reject(err2);
        }
        resolve(createdInvite);
      });
    });
  });
}

module.exports.acceptInvite = (acceptedBy, code) => {
  return new Promise((resolve, reject) => {
    InviteSchema.findOne({ code }).lean().exec((err, invite) => { // eslint-disable-line
      if (err) {
        reject(err);
      }
      if (!invite) {
        return reject(Boom.notFound(responseMessages.invite.ERROR_INVITE_NOT_FOUND));
      }
      invite.availedBy = invite.availedBy.map(item => item.toString());
      if (invite.availedBy && invite.availedBy.includes(acceptedBy.toString())) {
        return resolve({ alreadyAccepted: true });
      }
      let availedBy = invite.availedBy;
      if (invite.availedBy.length === 0) {
        availedBy = [acceptedBy];
      } else {
        availedBy.push(acceptedBy);
      }
      const params = {
        availedBy
      };
      InviteSchema.findOneAndUpdate({ code }, params, { new: true }).populate('initiator').exec((err2, updatedInvite) => {
        // transfer bonus points to intiator
        if (err2) {
          reject(err2);
        }
        return resolve({
          message: responseMessages.invite.SUCCESS_ACCEPT_INVITE,
          updatedInvite
        });
      });
    });
  });
}
module.exports.getInviteByCode = (code) => {
  return new Promise((resolve, reject) => {
    InviteSchema.findOne({ code }, (err, invite) => {
      if (err) {
        return reject(err);
      }
      return resolve(invite);
    });
  });
}

module.exports.getAllInvites = () => {
  return new Promise((resolve, reject) => {
    InviteSchema.find({ active: true }).populate('initiator availedBy').lean().exec((err, invites) => {
      if (err) {
        return reject(err);
      }
      const mappedInvites = invites.map((invite) => {
        const returnObj = {};
        if (invite.initiator) {
          returnObj.initiator = {
            _id: invite.initiator._id,
            username: invite.initiator.username
          };
        } else {
          invite.initiator = null;
        }
        if (invite.availedBy && invite.availedBy.length > 0) {
          returnObj.availedBy = invite.availedBy.map(user => ({
            _id: user._id,
            email: user.email,
            username: user.username,
            hasUploadedReceipt: user.hasUploadedReceipt,
            inviteBonusSent: user.inviteBonusSent
          }));
        } else {
          returnObj.availedBy = [];
        }
        returnObj.code = invite.code;
        return returnObj;
      });
      return resolve(mappedInvites);
    });
  });
}
