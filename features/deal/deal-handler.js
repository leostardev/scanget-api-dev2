// const config = require('../../config');
const Boom = require('boom');
const mongoose = require('mongoose');
const dealCtrl = require('./deal-controller');
const { addDealSchema, editDealSchema, approveDealSchema, rejectDealSchema, getAllDealsSchema, deactivateDealSchema, deleteDealSchema, addDealRetailerDiscountSchema, getTodayFlashDealSchema, getSimilarDealsSchema, getDealsRealtedToProductsSchema } = require('../utils/validation');
const userCtrl = require('../user/user-controller');
const periodDB = require('../period/period-model');
const config = require('../../config');

module.exports.addDeal = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    let validationError = addDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { otherSavings, limited, maxItems } = body;
    if (otherSavings) {
      for (let i = 0; i < otherSavings.length; i++) {
        validationError = addDealRetailerDiscountSchema(otherSavings[i]);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
      }
    }
    if (limited && (maxItems === 0 || !maxItems)) {
      throw Boom.forbidden('Max Items should be greater than 0');
    }
    const addDealData = {
      ...body
    };
    if (limited) {
      addDealData.clientConditions = `The Offer is valid for a limited number of pieces sold. ${addDealData.clientConditions}`;
    }
    if (currentUser.role === 'admin') {
      addDealData.approved = true;
    } else {
      delete addDealData.weight;
    }
    const data = await dealCtrl.addDeal(addDealData);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.editDeal = async (req, res, next) => {
  try {
    const { body, params } = req;
    let validationError = editDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { otherSavings } = body;
    if (otherSavings) {
      for (let i = 0; i < otherSavings.length; i++) {
        validationError = addDealRetailerDiscountSchema(otherSavings[i]);
        if (validationError) {
          throw Boom.badRequest(validationError);
        }
      }
    }
    const data = await dealCtrl.editDeal(body, params.dealId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.approveDeal = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = approveDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const data = await dealCtrl.approveDeal(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.rejectDeal = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = rejectDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    const data = await dealCtrl.rejectDeal(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deactivateDeal = async (req, res, next) => {
  try {
    const { body } = req;

    const validationError = deactivateDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { dealId } = body;

    const data = await dealCtrl.deactivateDeal(dealId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteDeal = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = deleteDealSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dealCtrl.deleteDeal(params.dealId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getDealById = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = deleteDealSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dealCtrl.getDealById(params.dealId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllDeals = async (req, res, next) => {
  try {
    let finalResponse;
    let scope;
    let userDetail;

    const { queryParams, currentUser } = req;
    const validationError = getAllDealsSchema(queryParams);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }

    if (currentUser.role === 'admin') {
      scope = 'full';
    }
    if (queryParams.user) {
      userDetail = await userCtrl.getByUserId(queryParams.user);
      // scope = userDetail.categories;
    }
    if (queryParams.client && scope !== 'full') {
      scope = 'client';
    }
    if (queryParams.promotion) {
      scope = 'promotion';
    }
    const data = await dealCtrl.getAllDeals(scope, queryParams);
    const currentPeriod = await periodDB.getCurrentPeriod();
    if (queryParams.user) {
      const modifiedResponse = data.map((deal) => {
        const currentDeal = userDetail.favoriteDeals.filter(item => item._id.toString() === deal._id.toString());
        let periods = [];
        deal.periods.map(period => {
          if (period._id.toString() === currentPeriod._id.toString()) {
            periods.push(period)
          }
          return {};
        })
        let isFav;
        if (currentDeal.length > 0) {
          isFav = true;
        } else {
          isFav = false;
        }
        return {
          ...deal,
          isFavourite: isFav,
          periods: currentUser.role === 'admin' ? deal.periods : periods
        };
      });
      finalResponse = modifiedResponse;
    } else {
      finalResponse = data;
    }

    res.json({
      success: true,
      data: finalResponse
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.exportDealsToCsv = async (req, res, next) => {
  try {
    const { queryParams } = req;
    const validationError = getAllDealsSchema(queryParams);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await dealCtrl.exportDealsToCsv(queryParams);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${data.Key}` }
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.getTodayFlashDeal = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = getTodayFlashDealSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { date } = body;
    const data = await dealCtrl.getTodayFlashDeal(date);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getSimilarDeals = async (req, res, next) => {
  let finalResponse;
  try {
    const { body, queryParams } = req;
    const validationError = getSimilarDealsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { category, deal } = body;
    const data = await dealCtrl.getSimilarDeals(category, deal);
    const userDetail = await userCtrl.getByUserId(queryParams.user);
    if (queryParams.user) {
      // eslint-disable-next-line no-shadow
      const modifiedResponse = data.map((deal) => {
        const currentDeal = userDetail.favoriteDeals.filter(item => item._id.toString() === deal._id.toString());
        let isFav;
        if (currentDeal.length > 0) {
          isFav = true;
        } else {
          isFav = false;
        }
        return {
          ...deal,
          isFavourite: isFav
        };
      });
      finalResponse = modifiedResponse;
    } else {
      finalResponse = data;
    }
    res.json({
      success: true,
      data: finalResponse
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getDealsRealtedToProducts = async (req, res, next) => {
  try {
    const { body } = req;
    if (!body.products) {
      throw Boom.notAcceptable('Missing products feild');
    }
    let validationError;
    for (let i = 0; i < body.products.length; i++) {
      validationError = getDealsRealtedToProductsSchema(body.products[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }

    const { products } = body;

    const data = await dealCtrl.getDealsRealtedToProducts(products);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getCurrentMaximumWeight = async (req, res, next) => {
  try {
    const data = await dealCtrl.getCurrentMaximumWeight();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
module.exports.getDealId = (req, res, next) => {
  try {
    const _id = mongoose.Types.ObjectId();
    res.json({
      success: true,
      data: { _id }
    });
  } catch (e) {
    return next(e);
  }
}

// module.exports.s3DealUploadTrigger = async (req, res, next) => {
//   try {
//     console.log(JSON.stringify(event, null, 2));
//     // get s3 bucket name
//     const bucketName = config.assetsS3Bucket;
//     console.log(bucketName);
//     // get image key
//     const imageKey = event.Records[0].s3.object.key;
//     console.log(imageKey);
//     const thumbnailKey = imageKey.replace('deal', 'deal-thumbnails');
//     console.log(thumbnailKey);
//     await dealCtrl.uploadDealThumbnail(bucketName, imageKey, thumbnailKey);
//     console.log('Successfully added deal thumbnail');
//     // resize using sharp
//     // upload image to deal-thumb
//     context.done(null, event);
//   } catch (e) {
//     console.log(e);
//     return next(e);
//   }
// }
