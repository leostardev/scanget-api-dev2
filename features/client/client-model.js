const ClientSchema = require('./client-schema');

module.exports.createClient = (clientData) => {
  return new Promise((resolve, reject) => {
    ClientSchema.create(clientData, (err, newClient) => {
      if (err) {
        reject(err);
      }
      resolve(newClient);
    });
  });
}

module.exports.updateClientData = (cognitoId, updateData) => {
  return new Promise((resolve, reject) => {
    ClientSchema.findOneAndUpdate({ cognitoId }, updateData, (err, updateClient) => {
      if (err) {
        reject(err);
      }
      resolve(updateClient);
    });
  });
}

module.exports.updateClientById = (clientId, updateData) => {
  return new Promise((resolve, reject) => {
    ClientSchema.findByIdAndUpdate(clientId, updateData, { new: true }, (err, updatedClient) => {
      if (err) {
        reject(err);
      }
      resolve(updatedClient);
    });
  });
}

module.exports.getClientById = (clientId) => {
  return new Promise((resolve, reject) => {
    ClientSchema.findById(clientId, (err, client) => {
      if (err) {
        reject(err);
      }
      resolve(client);
    });
  });
}

module.exports.getAllClients = () => {
  return new Promise((resolve, reject) => {
    ClientSchema.find({}).populate('clientAdmin users').exec((err, clients) => {
      if (err) {
        reject(err);
      }
      resolve(clients);
    });
  });
}

module.exports.getAllClientsForApp = () => {
  return new Promise((resolve, reject) => {
    ClientSchema.find({ deactivated: false }, (err, clients) => {
      if (err) {
        reject(err);
      }
      resolve(clients);
    });
  });
}
