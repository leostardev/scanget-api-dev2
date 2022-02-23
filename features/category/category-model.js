const Boom = require('boom');
const CategorySchema = require('./category-schema');
const responseMessages = require('../utils/messages');
const ProductSchema = require('../product/product-schema');
const DealSchema = require('../deal/deal-schema');
const PromotionSchema = require('../promotion/promotion-schema');

module.exports.addCategory = (categoryData) => {
  const category = new CategorySchema(categoryData);
  return new Promise((resolve, reject) => {
    CategorySchema.find({ name: categoryData.name }, (err1, data) => { // eslint-disable-line
      if (data.length > 0) {
        return reject(Boom.forbidden(responseMessages.category.ALREADY_EXISTS));
      }
      category.save((err, createdCategory) => {
        if (err) {
          reject(err);
        }
        resolve(createdCategory);
      });
    });
  });
}

module.exports.updateCategory = (updateCategoryData, categoryId) => {
  return new Promise((resolve, reject) => {
    if (updateCategoryData.name) {
      CategorySchema.find({ name: updateCategoryData.name }, (err1, data) => { // eslint-disable-line
        if (data.length > 0) {
          return reject(Boom.forbidden(responseMessages.category.ALREADY_EXISTS));
        }
        CategorySchema.findOneAndUpdate({ _id: categoryId }, updateCategoryData, { new: true }, (err, updatedCategory) => {
          if (err) {
            reject(err);
          }
          resolve(updatedCategory);
        });
      });
    } else {
      resolve();
    }
  });
}

module.exports.deleteCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    CategorySchema.findById(categoryId, (err, category) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        name: `${category.name}-deleted`,
        active: false
      };
      CategorySchema.findOneAndUpdate({ _id: categoryId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        ProductSchema.update({ category: categoryId }, { active: false }, { multi: true }, (err3) => {
          if (err3) {
            reject(err3);
          }
          DealSchema.update({ category }, { active: false }, { multi: true }, (err4) => {
            if (err4) {
              reject(err4);
            }
            DealSchema.find({ category }, (err5, deals) => { // eslint-disable-line
              if (err5) {
                return reject(err5);
              }
              if (deals.length > 0) {
                deals = deals.map(item => item._id);
                PromotionSchema.update({ deal: { $in: deals } }, { active: false }, { multi: true, new: true }, (err6) => { // eslint-disable-line
                  if (err6) {
                    return reject(err6);
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
  });
}

module.exports.getAllCategories = () => {
  return new Promise((resolve, reject) => {
    CategorySchema.find({ active: true }).lean().exec((err, allCategories) => {
      if (err) {
        reject(err);
      }
      resolve(allCategories);
    });
  });
}

module.exports.getACategoryById = (categoryId) => {
  return new Promise((resolve, reject) => {
    CategorySchema.findById(categoryId, (err, category) => {
      if (err) {
        reject(err);
      }
      resolve(category);
    });
  });
}

module.exports.getCategoryByName = (name) => {
  return new Promise((resolve, reject) => {
    CategorySchema.find({ name, active: true }, (err, category) => {
      if (err) {
        reject(err);
      }
      resolve(category);
    });
  });
}
