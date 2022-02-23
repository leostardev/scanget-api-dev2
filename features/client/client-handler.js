const Boom = require('boom');
const randomatic = require('randomatic');
const clientCtrl = require('./client-controller');
const { createClientSchema, checkDeactivateClientAccountSchema, checkActivateClientAccountSchema, createClientUserSchema, removeClientUserSchema, updateClientDetailsSchema } = require('../utils/validation');
const responseMessages = require('../utils/messages');
const authCtrl = require('../authentication/authentication-controller');
const { sendCredsToClient, sendCredsToClientUser } = require('../utils/email');
const userDB = require('../user/user-model');

module.exports.createClient = async (req, res, next) => { // eslint-disable-line
  try {
    const { body } = req;
    const validationError = createClientSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const {
      email, _id, name, logo
    } = body;
    const password = randomatic('0', 6);
    const clientData = {
      username: name,
      role: 'client-admin',
      email,
      _id,
      password
    };
    const clientLoginData = await authCtrl.signUpUser(clientData);
    const createClientData = {
      name,
      email,
      logo,
      clientAdmins: [clientLoginData.mongoDB._id],
      cognitoId: clientLoginData.cognito.sub
    };
    const createdClientData = await clientCtrl.createClient(createClientData);
    await userDB.updateUserDetails({ client: createdClientData._id }, clientLoginData.cognito.cognitoId);
    // email password to client
    const params = {
      password,
      email
    };
    await sendCredsToClient(params);
    res.json({
      success: true,
      data: createdClientData,
      message: responseMessages.client.SUCCESS_CREATE_CLIENT
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateClient = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = checkDeactivateClientAccountSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { clientId } = body;
    await clientCtrl.updateClientDataById(clientId, { deactivated: true });
    // deactivate clientAdmin and all users
    const client = await clientCtrl.getClientById(clientId);
    const deactivateUsersList = [...client.clientAdmins, ...client.users];
    const $promises = [];
    for (let i = 0; i < deactivateUsersList.length; i++) {
      $promises.push(authCtrl.deactivateAccountByMongoId(deactivateUsersList[i], true));
    }
    await Promise.all($promises);
    res.json({
      success: true,
      data: {},
      message: responseMessages.client.SUCCESS_DEACTIVATE_CLIENT
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.activateClient = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = checkActivateClientAccountSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { clientId } = body;
    await clientCtrl.updateClientDataById(clientId, { deactivated: false });
    // deactivate clientAdmin and all users
    const client = await clientCtrl.getClientById(clientId);
    const activateUsersList = [...client.clientAdmins, ...client.users];
    const $promises = [];
    for (let i = 0; i < activateUsersList.length; i++) {
      $promises.push(authCtrl.activateAccountByMongoId(activateUsersList[i], true));
    }
    await Promise.all($promises);
    res.json({
      success: true,
      data: {},
      message: responseMessages.client.SUCCESS_ACTIVATE_CLIENT
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.createClientUser = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser, body, params } = req;
    const { clientId } = params;
    const validationError = createClientUserSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const clientMongoData = await userDB.getUserByCognitoId(currentUser.cognitoId);
    if (currentUser.role !== 'client-admin' || clientMongoData.client.toString() !== clientId.toString()) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const {
      email, name
    } = body;
    const password = randomatic('0', 6);
    const clientData = {
      username: name,
      role: 'client-user',
      email,
      password,
      client: clientId
    };
    const clientLoginData = await authCtrl.signUpUser(clientData);
    const updatedCientData = await clientCtrl.addClientUser(clientId, clientLoginData.mongoDB._id);
    // email password to client
    const emailParams = {
      password,
      email,
      clientName: updatedCientData.name
    };
    await sendCredsToClientUser(emailParams);
    res.json({
      success: true,
      data: clientLoginData,
      message: responseMessages.client.SUCCESS_ADD_CLIENT_USER
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.removeClientUser = async (req, res, next) => { // eslint-disable-line
  try {
    const { currentUser, body, params } = req;
    const { clientId } = params;
    const validationError = removeClientUserSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const clientMongoData = await userDB.getUserByCognitoId(currentUser.cognitoId);
    if (currentUser.role !== 'client-admin' || clientMongoData.client.toString() !== clientId.toString()) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    }
    const updatedClientData = await clientCtrl.removeClientUser(clientId, body.userId);
    res.json({
      success: true,
      data: updatedClientData,
      message: responseMessages.client.SUCCESS_REMOVE_CLIENT_USER
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateClientDetails = async (req, res, next) => { // eslint-disable-line
  try {
    const { body, params } = req;
    const { clientId } = params;
    const validationError = updateClientDetailsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const updatedClientData = await clientCtrl.updateClientDataById(clientId, body);
    res.json({
      success: true,
      data: updatedClientData,
      message: responseMessages.client.SUCCESS_UPDATE_CLIENT_DETAILS
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllClients = async (req, res, next) => { // eslint-disable-line
  try {
    const allClients = await clientCtrl.getAllClients();
    res.json({
      success: true,
      data: allClients,
      message: responseMessages.client.SUCCESS_GET_ALL_CLIENTS
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllClientsForApp = async (req, res, next) => { // eslint-disable-line
  try {
    const allClients = await clientCtrl.getAllClientsForApp();
    res.json({
      success: true,
      data: allClients,
      message: responseMessages.client.SUCCESS_GET_ALL_CLIENTS
    });
  } catch (e) {
    return next(e);
  }
}
