const Boom = require('boom');
const clientDb = require('./client-model');
const responseMessages = require('../utils/messages');

module.exports.createClient = async (clientData) => {
  try {
    const newClient = await clientDb.createClient(clientData);
    return newClient;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_CREATE_CLIENT, err);
  }
}

module.exports.updateClientData = async (cognitoId, updateData) => {
  try {
    const newClient = await clientDb.updateClientData(cognitoId, updateData);
    return newClient;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_UPDATE_CLIENT_DETAILS, err);
  }
}

module.exports.addClientUser = async (clientId, userId) => {
  try {
    const client = await clientDb.getClientById(clientId);
    let updatedUsers = [];
    if (client) {
      if (client.users) {
        updatedUsers = [...client.users, userId];
      } else {
        updatedUsers = [userId];
      }
      const updateData = { users: updatedUsers };
      const updatedClient = await clientDb.updateClientById(clientId, updateData);
      return updatedClient;
    }
    return null;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_ADD_CLIENT_USER, err);
  }
}

module.exports.removeClientUser = async (clientId, userId) => {
  try {
    const client = await clientDb.getClientById(clientId);
    const updatedUsers = [];
    if (client) {
      for (let i = 0; i < client.users.length; i++) {
        if (client.users[i].toString() !== userId.toString()) {
          updatedUsers.push(client.users[i]);
        }
      }
      const updateData = { users: updatedUsers };
      const updatedClient = await clientDb.updateClientById(clientId, updateData);
      return updatedClient;
    }
    return null;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_REMOVE_CLIENT_USER, err);
  }
}

module.exports.updateClientDataById = async (clientId, updateData) => {
  try {
    const updatedClient = await clientDb.updateClientById(clientId, updateData);
    return updatedClient;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_UPDATE_CLIENT_DETAILS, err);
  }
}

module.exports.getAllClients = async () => {
  try {
    const allClientsData = await clientDb.getAllClients();
    return allClientsData;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_GET_ALL_CLIENTS, err);
  }
}

module.exports.getAllClientsForApp = async () => {
  try {
    let allClientsData = await clientDb.getAllClientsForApp();
    allClientsData = allClientsData.map(client => client.name);
    return allClientsData;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_GET_ALL_CLIENTS, err);
  }
}

module.exports.getClientById = async (clientId) => {
  try {
    const clientData = await clientDb.getClientById(clientId);
    return clientData;
  } catch (err) {
    throw Boom.internal(responseMessages.client.ERROR_GET_ALL_CLIENTS, err);
  }
}
