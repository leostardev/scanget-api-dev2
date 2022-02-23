const Boom = require('boom');
const inviteCtrl = require('./invite-controller');
const { createInviteCodeSchema, acceptInviteSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');

module.exports.createInviteCode = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = createInviteCodeSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await inviteCtrl.createOrGetInvite(body.user);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.acceptInvite = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = acceptInviteSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await inviteCtrl.acceptInvite(body.availedBy, body.code, false, true);
    if (data.alreadyAccepted) {
      res.json({
        success: true,
        message: responseMessages.invite.ERROR_ALREADY_AVAILED
      });
    } else {
      res.json({
        success: true,
        message: responseMessages.invite.SUCCESS_SENT_INVITE_BONUS
      });
    }
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllInvites = async (req, res, next) => {
  try {
    const { currentUser } = req;
    if (currentUser.role !== 'admin') {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const data = await inviteCtrl.getAllInvites();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
