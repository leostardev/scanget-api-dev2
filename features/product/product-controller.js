const Boom = require('boom');
const moment = require('moment');
const productDB = require('./product-model');
const responseMessages = require('../utils/messages');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');

module.exports.addProduct = async (product) => {
  try {
    const createdProduct = await productDB.addProduct(product);
    return createdProduct;
  } catch (error) {
    throw Boom.forbidden(responseMessages.product.ERROR_ADDING_PRODUCT, error);
  }
}

module.exports.updateProduct = async (updateData, productId) => {
  try {
    const updatedProduct = await productDB.updateProduct(updateData, productId);
    return updatedProduct;
  } catch (error) {
    throw Boom.forbidden(responseMessages.product.ERROR_UPDATING_PRODUCT, error);
  }
}

module.exports.deleteProduct = async (productId) => {
  try {
    await productDB.deleteProduct(productId);
    return {
      message: responseMessages.product.SUCCESS_DELETE_PRODUCT
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.product.ERROR_DELETING_PRODUCT, error);
  }
}

module.exports.getAllProducts = async (queryParams) => {
  try {
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      queryParams.minDate = moment(new Date(queryParams.minDate)).startOf('day');
      queryParams.maxDate = moment(new Date(queryParams.maxDate)).endOf('day');
    }
    const allProducts = await productDB.getAllProducts(queryParams);
    return allProducts;
  } catch (error) {
    console.log(error);
    throw Boom.forbidden(responseMessages.product.ERROR_GETTING_ALL_PRODUCTS, error);
  }
}

module.exports.getProductById = async (productId) => {
  try {

    const allProducts = await productDB.getProductById(productId);
    return allProducts;
  } catch (error) {
    console.log(error);
    throw Boom.forbidden(responseMessages.product.ERROR_GETTING_PRODUCT_BY_ID, error);
  }
}

module.exports.exportProductsToCsv = async (queryParams) => {
  try {
    if (queryParams && queryParams.minDate && queryParams.maxDate) {
      queryParams.minDate = moment(new Date(queryParams.minDate)).startOf('day');
      queryParams.maxDate = moment(new Date(queryParams.maxDate)).endOf('day');
    }
    let allProducts = await productDB.getAllProductsForCSV(queryParams);
    allProducts = allProducts.map((product) => {
      const newData = {
        _id: product._id.toString(),
        sid: product.sid.toString(),
        name: product.name.toString(),
        client: product.client._id.toString(),
        active: product.active.toString(),
        createdAt: moment(product.createdAt).format('DD MMM,YYYY'),
        updatedAt: moment(product.updatedAt).format('DD MMM,YYYY'),
        category: {
          _id: product.category._id.toString(),
          sid: product.category.sid.toString(),
          active: product.category.active.toString(),
          name: product.category.name.toString(),
          createdAt: moment(product.category.createdAt).format('DD MMM,YYYY'),
          updatedAt: moment(product.category.updatedAt).format('DD MMM,YYYY')
        },
        price: parseFloat(product.price || 0).toFixed(2),
        barcode: product.barcode.toString()
      };
      return newData;
    });
    const s3UploadData = await createAndUploadCsvToS3(allProducts, `products-csv/${Date.now()}/products.csv`);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_GETTING_ALL_RECEIPTS, error);
  }
}

module.exports.getProductsByCategory = async (params, queryParams) => {
  try {
    const { categoryId } = params;
    const { client } = queryParams;
    const allProducts = await productDB.getProductsByCategory(categoryId, client);
    return allProducts;
  } catch (error) {
    throw Boom.forbidden(responseMessages.product.ERROR_GETTING_ALL_PRODUCTS, error);
  }
}
