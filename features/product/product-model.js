const Boom = require('boom');
const mongoose = require('mongoose');
const ProductSchema = require('./product-schema');
const responseMessages = require('../utils/messages');
const DealSchema = require('../deal/deal-schema');
const PromotionSchema = require('../promotion/promotion-schema');
const ClientSchema = require("../client/client-schema"); //eslint-disable-line

module.exports.addProduct = (productData) => {
  // const product = new ProductSchema(productData);
  return new Promise((resolve, reject) => {
    ProductSchema.find({ name: productData.name, category: productData.category, client: productData.client }).populate('category').exec((err1, data) => { // eslint-disable-line
      if (err1) {
        reject(err1);
      }
      if (data.length > 0) {
        return reject(Boom.forbidden(responseMessages.product.ALREADY_EXISTS));
      }
      ProductSchema.create(productData, (err, createdProduct) => {
        if (err) {
          reject(err);
        }
        ProductSchema.findById(createdProduct._id).populate('category client').exec((err3, populatedProduct) => {
          if (err3) {
            reject(err3);
          }
          resolve(populatedProduct);
        });
      });
    });
  });
}

module.exports.updateProduct = (updateProductData, productId) => {
  return new Promise((resolve, reject) => {
    ProductSchema.findById(productId, (err1, data) => { // eslint-disable-line
      if (!data) {
        return reject(Boom.notFound(responseMessages.product.NOT_FOUND));
      }
      let requestData = { ...data, ...updateProductData };
      requestData = { name: requestData.name, category: requestData.category, client: requestData.client };
      ProductSchema.find(requestData, (err2, data) => { // eslint-disable-line
        if (data && data.length > 0 && data[0]._id.toString() !== productId.toString()) {
          return reject(Boom.forbidden(responseMessages.product.ALREADY_EXISTS));
        }
        ProductSchema.findOneAndUpdate({ _id: productId }, updateProductData, { new: true }).populate('category client').exec((err, updatedProduct) => {
          if (err) {
            reject(err);
          }
          resolve(updatedProduct);
        });
      });
    });
  });
}

module.exports.deleteProduct = (productId) => {
  return new Promise((resolve, reject) => {
    ProductSchema.findById(productId, (err, product) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        name: `${product.name}-deleted`,
        active: false
      };
      ProductSchema.findOneAndUpdate({ _id: productId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        DealSchema.update({ product: productId }, { active: false }, { multi: true, new: true }, (err3) => {
          if (err3) {
            reject(err3);
          }
          DealSchema.find({ product: productId }, (err4, deals) => {
            if (err4) {
              reject(err4);
            }
            if (deals.length > 0) {
              deals = deals.map(deal => deal._id);
              PromotionSchema.update({ deal: { $in: deals } }, { active: false }, { multi: true, new: true }, (err5) => {
                if (err5) {
                  reject(err5);
                }
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      });
    });
  });
}

module.exports.getProductById = (productId) => {
  return new Promise((resolve, reject) => {
    ProductSchema.findById(productId).populate('category client').exec((err, productData) => { // eslint-disable-line
      if (err) {
        return reject(Boom.notFound(responseMessages.product.NOT_FOUND));
      }
      resolve(productData)
    });
  });
}

module.exports.getAllProducts = (queryParams) => {
  const searchText = queryParams.search;
  let filterTextQuery = {};
  const limit = parseInt(queryParams.limit || 50)
  const skip = parseInt(queryParams.skip || 0) * limit;
  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'category.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'client.name': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    }
  }
  const query = {
    active: true
  };
  if (queryParams.productId) {
    query._id = mongoose.Types.ObjectId(queryParams.productId)
  }
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: queryParams.minDate,
      $lte: queryParams.maxDate
    };
  }
  if (queryParams && queryParams.client !== 'all') {
    query.client = mongoose.Types.ObjectId(queryParams.client);
  }
  if (queryParams.category) {
    query.category = mongoose.Types.ObjectId(queryParams.category);
  }
  return new Promise((resolve, reject) => {
    ProductSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $lookup:
        {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $match: filterTextQuery
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
      .exec((err, allProducts) => {
        if (err) {
          reject(err);
        }
        resolve(allProducts && allProducts.length > 0 ? allProducts[0] : { total: 0, data: [] });
      });
  });
}

module.exports.getAllProductsForCSV = (queryParams) => {
  const searchText = queryParams.search;
  let filterTextQuery = {};
  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'category.name': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'client.name': { $regex: `.*${searchText}.*`, $options: '-i' } }
      ]
    }
  }
  const query = {
    active: true
  };
  if (queryParams.productId) {
    query._id = mongoose.Types.ObjectId(queryParams.productId)
  }
  if (queryParams && queryParams.minDate && queryParams.maxDate) {
    query.createdAt = {
      $gte: queryParams.minDate,
      $lte: queryParams.maxDate
    };
  }
  if (queryParams && queryParams.client !== 'all') {
    query.client = queryParams.client;
  }
  if (queryParams.category) {
    query.category = mongoose.Types.ObjectId(queryParams.category);
  }
  return new Promise((resolve, reject) => {
    ProductSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $lookup:
        {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $match: filterTextQuery
      }
    ]).exec((err, allProducts) => {
      if (err) {
        reject(err);
      }
      resolve(allProducts);
    });
  });
}

module.exports.getProductsByCategory = (category, client) => {
  const query = {
    category,
    active: true
  };
  if (client) {
    query.client = client;
  }
  return new Promise((resolve, reject) => {
    ProductSchema.find(query).exec((err, allProducts) => {
      if (err) {
        reject(err);
      }
      resolve(allProducts);
    });
  });
}

module.exports.getProductsById = (id) => {
  return new Promise((resolve, reject) => {
    ProductSchema.findById(id, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
