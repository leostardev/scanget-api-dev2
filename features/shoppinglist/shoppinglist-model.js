const Boom = require('boom');
const ShoppinglistSchema = require('./shoppinglist-schema');
const responseMessages = require('../utils/messages');

module.exports.addShoppinglist = shoppinglistData => {
  const { name, user } = shoppinglistData;
  const shoppinglist = new ShoppinglistSchema(shoppinglistData);
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.find({ name, user, active: true }, (err1, data) => { // eslint-disable-line
      if (data.length > 0) {
        return reject(Boom.forbidden(responseMessages.shoppinglist.ALREADY_EXISTS));
      }
      shoppinglist.save((err, createdShoppinglist) => {
        if (err) {
          reject(err);
        }
        resolve(createdShoppinglist);
      });
    });
  });
}

module.exports.updateShoppinglist = (updateShoppinglistData, shoppinglistId) => {
  const { name, user } = updateShoppinglistData;
  return new Promise((resolve, reject) => {
    if (updateShoppinglistData.name) {
      ShoppinglistSchema.find({ name, user, active: true }, (err1, data) => { // eslint-disable-line
        if (data.length > 0) {
          return reject(Boom.forbidden(responseMessages.shoppinglist.ALREADY_EXISTS));
        }
        ShoppinglistSchema.findOneAndUpdate({ _id: shoppinglistId }, updateShoppinglistData, { new: true }, (err, updatedShoppinglist) => {
          if (err) {
            reject(err);
          }
          resolve(updatedShoppinglist);
        });
      });
    } else {
      ShoppinglistSchema.findOneAndUpdate({ _id: shoppinglistId }, updateShoppinglistData, { new: true }, (err, updatedShoppinglist) => {
        if (err) {
          reject(err);
        }
        resolve(updatedShoppinglist);
      });
    }
  });
}

module.exports.deleteShoppinglist = shoppinglistId => {
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.findByIdAndUpdate(shoppinglistId, { active: false }, (err, shoppinglist) => {
      if (err) {
        reject(err);
      }
      resolve(shoppinglist);
    });
  });
}

module.exports.getAllShoppinglists = family => {
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.find({ active: true, family }, (err, allShoppinglists) => {
      if (err) {
        reject(err);
      }
      resolve(allShoppinglists);
    });
  });
}

module.exports.getAllShoppinglistsForRestructure = () => {
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.find({}, (err, allShoppinglists) => {
      if (err) {
        reject(err);
      }
      resolve(allShoppinglists);
    });
  });
}

module.exports.getAShoppinglistById = shoppinglistId => {
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.findById(shoppinglistId, (err, shoppinglist) => {
      if (err) {
        reject(err);
      }
      resolve(shoppinglist);
    });
  });
}

module.exports.getShoppinglistByName = (name, family) => {
  return new Promise((resolve, reject) => {
    ShoppinglistSchema.find({ name, family, active: true }, (err, shoppinglist) => {
      if (err) {
        reject(err);
      }
      resolve(shoppinglist);
    });
  });
}
