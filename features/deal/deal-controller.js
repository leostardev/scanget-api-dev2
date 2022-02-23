/* eslint-disable require-atomic-updates */
const Boom = require('boom');
const moment = require('moment');
const AWS = require('aws-sdk');
const fs = require('fs');
const Jimp = require('jimp');
const randomNumber = require('random-number-arrays');
const dealDB = require('./deal-model');
const responseMessages = require('../utils/messages');
const productDB = require('../product/product-model');
const clientPackageDB = require('../client-package/client-package-model');
const periodDB = require('../period/period-model');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');

module.exports.addDeal = async (deal) => {
  try {
    deal.availedItems = 0;
    let periods = await periodDB.getPeriodsByIds(deal.periods);
    periods = periods.map(period => period.description);
    // eslint-disable-next-line require-atomic-updates
    deal.description = `For each ${deal.title} purchased in ${periods.join(',')} and get ${deal.savingType === 'percent' ? `${deal.savedPercent} %` : `€ ${deal.savingAmount}`} back.`;

    // if (deal.dType === 'flash') {
    //   const flashDeal = await getTodayFlashDeal(deal.startDate, deal.endDate, 'addFlashDeal');
    //   if (flashDeal && flashDeal._id) {
    //     const startDate = moment(flashDeal.startDate).format('DD-MM-YYYY');
    //     const endDate = moment(flashDeal.endDate).format('DD-MM-YYYY');
    //     throw Boom.forbidden(`Dates between ${startDate} and ${endDate} ${responseMessages.deal.ALREADY_CREATED}`);
    //   }
    //   deal.endDate = moment(new Date(deal.endDate)).endOf('day');
    // }
    if (deal.dType === 'normal') {
      delete deal.displayDate;
    }
    // deal.startDate = moment(new Date(deal.startDate)).format('YYYY-MM-DD');
    // deal.endDate = moment(new Date(deal.endDate)).format('YYYY-MM-DD');
    const otherSavings = [];
    if (deal.otherSavings && deal.otherSavings.length > 0) {
      for (let i = 0; i < deal.otherSavings.length; i++) {
        for (let j = 0; j < deal.otherSavings[i].shop.length; j++) {
          otherSavings.push({
            retailer: deal.otherSavings[i].retailer,
            shop: deal.otherSavings[i].shop[j],
            amount: deal.otherSavings[i].amount
          });
        }
      }
    }
    deal.otherSavings = otherSavings;
    let createdDeal = await dealDB.addDeal(deal);
    const dealClone = { ...createdDeal._doc };
    let dealArrayForStatus = [dealClone];
    dealArrayForStatus = await attachStatusToDeals(dealArrayForStatus);
    createdDeal = dealArrayForStatus[0];
    const updateProductData = {
      latestOffer: {
        title: deal.title,
        deal: createdDeal._id,
        periods: createdDeal.periods.map(period => period.description)
      }
    };
    await productDB.updateProduct(updateProductData, deal.product);
    return createdDeal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_ADDING_DEAL, error);
  }
}

module.exports.editDeal = async (deal, dealId) => {
  try {
    if (deal.startDate) {
      deal.startDate = moment(new Date(deal.startDate)).format('YYYY-MM-DD');
    }
    if (deal.endDate) {
      deal.endDate = moment(new Date(deal.endDate)).format('YYYY-MM-DD');
    }
    let updatedDeal = await dealDB.editDeal(deal, dealId);
    let dealArrayForStatus = [updatedDeal];
    dealArrayForStatus = await attachStatusToDeals(dealArrayForStatus);
    updatedDeal = dealArrayForStatus[0];
    const updateProductData = {
      latestOffer: {
        title: updatedDeal.title,
        deal: updatedDeal._id,
        periods: updatedDeal.periods.map(period => period.description)
      }
    };
    await productDB.updateProduct(updateProductData, deal.product);
    return updatedDeal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_UPDATING_DEAL, error);
  }
}

module.exports.approveDeal = async (body) => {
  try {
    const {
      dealId,
      clientPackageId,
      weight,
      conditions
    } = body;
    const updateDealData = {
      clientPackage: clientPackageId,
      approved: true,
      weight,
      conditions
    };
    const deal = await dealDB.getDealById(dealId);
    if (deal.dType === 'flash') {
      // const getPeriodRanges
      const periods = deal.periods.map(period => period.description);
      const flashDeal = await dealDB.getFlashDealByPeriod(periods);
      if (flashDeal && flashDeal.length > 0) {
        throw Boom.forbidden('Flash deal for requested period already exists');
      }
    }
    const updatedDeal = await dealDB.editDeal(updateDealData, dealId);
    await clientPackageDB.decreaseSlots(clientPackageId, deal.periods.length);
    return updatedDeal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_APPROVING_DEAL, error);
  }
}

module.exports.rejectDeal = async (body) => {
  try {
    const { dealId, reason } = body;
    const updateDealData = {
      reason,
      rejected: true
    };
    const updatedDeal = await dealDB.editDeal(updateDealData, dealId);
    return updatedDeal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_APPROVING_DEAL, error);
  }
}

module.exports.deactivateDeal = async (dealId) => {
  try {
    const updateDealData = {
      deactivated: true
    };
    const updatedDeal = await dealDB.editDeal(updateDealData, dealId);
    return updatedDeal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_APPROVING_DEAL, error);
  }
}

module.exports.deleteDeal = async (dealId) => {
  try {
    await dealDB.deleteDeal(dealId);
    return {
      message: responseMessages.deal.SUCCESS_DELETE_DEAL
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_DELETING_DEAL, error);
  }
}

module.exports.getDealById = async (dealId) => {
  try {
    const deal = await dealDB.getDealById(dealId);
    return deal;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_DEAL_BY_ID, error);
  }
}

module.exports.getAllDeals = async (scope, queryParams) => {
  try {
    let dealsData;
    if (scope === 'full') {
      dealsData = await dealDB.getAllDealsForAdmin(queryParams);
      dealsData.allDeals = await attachStatusToDeals(dealsData.data);
      delete dealsData.data;
      for (let i = 0; i < dealsData.allDeals.length; i++) {
        if (!dealsData.allDeals[i].thumbnail) {
          dealsData.allDeals[i].thumbnail = dealsData.allDeals[i].image.replace('deal', 'deal-thumbnails');
        }
        if (dealsData.allDeals[i].otherSavings && dealsData.allDeals[i].otherSavings.length > 0) {
          // eslint-disable-next-line no-nested-ternary
          dealsData.allDeals[i].otherSavings = dealsData.allDeals[i].otherSavings.sort((a, b) => ((a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0)));
          dealsData.allDeals[i].highestSaving = { ...dealsData.allDeals[i].otherSavings[0] };
          dealsData.allDeals[i].highestSaving.retailer = dealsData.allDeals[i].highestSaving.retailer.name;
        }
        dealsData.allDeals[i].weight = dealsData.allDeals[i].weight || 0;
      }
      return dealsData;
    } else if (!scope || scope === 'promotion') {
      dealsData = await dealDB.getAllDeals();
    } else if (scope === 'client') {
      dealsData = await dealDB.getAllDealsForClient(queryParams.client);
    } else {
      const category = scope;
      dealsData = await dealDB.getAllDeals(category);
    }
    for (let i = 0; i < dealsData.length; i++) {
      if (!dealsData[i].thumbnail) {
        dealsData[i].thumbnail = dealsData[i].image.replace('deal', 'deal-thumbnails');
      }
      if (dealsData[i].otherSavings && dealsData[i].otherSavings.length > 0) {
        // eslint-disable-next-line no-nested-ternary
        dealsData[i].otherSavings = dealsData[i].otherSavings.sort((a, b) => ((a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0)));
        dealsData[i].highestSaving = { ...dealsData[i].otherSavings[0] };
        dealsData[i].highestSaving.retailer = dealsData[i].highestSaving.retailer.name;
      }
      dealsData[i].weight = dealsData[i].weight || 0;
    }
    return dealsData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_ALL_DEALS, error);
  }
}

module.exports.exportDealsToCsv = async (queryParams) => {
  try {
    let dealsData;
    dealsData = await dealDB.getAllDealsForCSV(queryParams);
    dealsData = await attachStatusToDeals(dealsData);
    dealsData = dealsData.map(deal => {
      return {
        ...deal,
        _id: deal._id.toString(),
        periods: deal.periods ? mergePeriodIds(deal.periods) : '',
        client: deal.client ? deal.client._id.toString() : '',
        category: deal.category ? deal.category._id.toString() : '',
        product: deal.product ? deal.product._id.toString() : ''
      }
    })
    const s3UploadData = await createAndUploadCsvToS3(dealsData, `deals-csv/${Date.now()}/deals.csv`);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_ALL_DEALS, error);
  }
}

const mergePeriodIds = (period) => {
  let str = '';
  // eslint-disable-next-line array-callback-return
  period.map(p => {
    str += `${p._id.toString()} `
  })
  return str;
}

module.exports.getUserFavoriteCategoryDeals = async (filterCategories) => {
  try {
    let query = {};
    if (filterCategories && filterCategories.length > 0) {
      query = {
        category: {
          $in: filterCategories
        }
      };
    }
    const dealsData = await dealDB.getAllDeals(query);
    return dealsData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_ALL_DEALS, error);
  }
}

module.exports.getTodayFlashDeal = async () => {
  try {
    // const params = {
    //   dType: 'flash'
    // };
    const currentPeriod = await periodDB.getCurrentPeriod();
    const periodName = currentPeriod ? currentPeriod.description : 'null';
    console.log(periodName);
    // if (startDate && endDate) { // case for checking flash deal in date range (creating  flash deal)
    //   params.startDate = moment(new Date(startDate)).startOf('day');
    //   params.endDate = moment(new Date(endDate)).endOf('day');
    // } else if (startDate && !endDate) { // case for getting current day flash deal
    //   params.startDate = moment(new Date(startDate)).startOf('day').add(12, 'H');
    //   params.endDate = moment(new Date(startDate)).startOf('day').subtract(12, 'H');
    // }
    const flashDeals = await dealDB.getFlashDealByPeriod([periodName]);
    // const dealsData = await dealDB.getTodayFlashDeal(params, type);
    return flashDeals.length > 0 ? flashDeals[0] : null;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_ALL_DEALS, error);
  }
}

module.exports.getSimilarDeals = async (category, dealId) => {
  try {
    let deals = await dealDB.getDealsByCategoryId(category);
    deals = deals.filter((deal) => {
      if (deal._id.toString() !== dealId.toString()) {
        return true;
      }
      return false;
    });
    if (deals.length <= 4) {
      return deals.map((deal) => {
        let thumbnail = deal.thumbnail;
        if (!thumbnail) {
          thumbnail = deal.image.replace('deal', 'deal-thumbnails');
        }
        return {
          ...deal,
          thumbnail
        };
      });
    }
    const randomValues = [];
    while (randomValues.length !== 4) {
      const newNumber = randomNumber({
        min: 0,
        max: deals.length - 1,
        type: 'number'
      });
      if (!randomValues.includes(newNumber)) {
        randomValues.push(newNumber);
      }
    }
    let similarDeals = [];
    for (let i = 0; i < randomValues.length; i++) {
      similarDeals.push(deals[randomValues[i]]);
    }
    similarDeals = similarDeals.map((deal) => {
      let thumbnail = deal.thumbnail;
      if (!thumbnail) {
        thumbnail = deal.image.replace('deal', 'deal-thumbnails');
      }
      return {
        ...deal,
        thumbnail
      };
    });
    return similarDeals;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_SIMILAR_DEALS, error);
  }
}

module.exports.getDealsRealtedToProducts = async (products) => {
  try {
    const dealsData = await dealDB.getDealsRealtedToProducts(products);
    for (let i = 0; i < dealsData.length; i++) {
      for (let j = 0; j < products.length; j++) {
        if (dealsData[i].product && dealsData[i].product._id && dealsData[i].product._id.toString() === products[j].product.toString()) {
          const quantity = dealsData[i].quantity ? dealsData[i].quantity : 0;
          const productQuantity = products[j].quantity;
          // eslint-disable-next-line radix
          const dealQuantity = parseInt(productQuantity / quantity);
          dealsData[i].dealQuantity = dealQuantity;
        }
      }
      let highestSavings = -1;
      let index = -1;
      for (let k = 0; k < dealsData[i].otherSavings.length; k++) {
        if (dealsData[i].otherSavings[k].amount > highestSavings) {
          highestSavings = dealsData[i].otherSavings[k].amount;
          index = k;
        }
      }
      if (index !== -1) {
        dealsData[i].highestSaving = dealsData[i].otherSavings[index];
      }
    }
    return dealsData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_PRODUCT_RELATED_DEALS, error);
  }
}

module.exports.getCurrentMaximumWeight = async () => {
  try {
    const maxWeight = await dealDB.getCurrentMaximumWeight();
    return maxWeight;
  } catch (error) {
    throw Boom.forbidden(responseMessages.deal.ERROR_GETTING_MAX_WEIGHT, error);
  }
}

module.exports.uploadDealThumbnail = (bucketName, imageKey, thumbnailKey) => {
  return new Promise((resolve, reject) => {
    try {
      // const orignalFile = `/tmp/${imageKey}`;
      // const targetFile = `/tmp/${thumbnailKey}`;
      const orignalFile = `/tmp/sng-original.${Date.now()}.jpeg`;
      const targetFile = `/tmp/sng.${Date.now()}.jpeg`;
      const s3 = new AWS.S3();
      s3.getObject({
        Bucket: bucketName,
        Key: imageKey
      }, (err, data) => {
        if (err) {
          reject(Boom.expectationFailed(responseMessages.receipt.ERROR_GETTING_FILE_S3, err));
        } else {
          console.log('success get s3 object');
          const imageStr = data.Body.toString('utf-8');
          const buf = new Buffer(imageStr, 'base64'); // eslint-disable-line
          fs.writeFileSync(orignalFile, buf, 'base64');
          console.log('successfuly write original file');
          let retryAttempts = 0;
          let image;
          let jimpErr;
          Jimp.read(orignalFile, async (err2, readImage) => {
            image = readImage;
            jimpErr = err2;
            console.log(image);
            while (retryAttempts < 3) {
              if (!image || jimpErr) {
                console.log(`retrying ${retryAttempts}`);
                retryAttempts++;
                try {
                  image = await retryS3Upload(bucketName, imageKey, orignalFile);
                  jimpErr = null;
                } catch (error) {
                  jimpErr = error;
                }
                console.log(`Got Image ${image}`);
              } else {
                break;
              }
            }
            if (!image || jimpErr) {
              reject(Boom.expectationFailed(responseMessages.receipt.ERROR_JIMP, jimpErr));
            }
            await image.resize(300, 300).writeAsync(targetFile); // save

            fs.readFile(targetFile, (err3, fileData) => {
              if (err3) {
                console.log(err3);
                reject(Boom.expectationFailed(responseMessages.receipt.ERROR_FS, err3));
              }
              const updateFile = {
                Bucket: bucketName,
                Body: fileData,
                Key: thumbnailKey,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg'
              };

              s3.putObject(updateFile, (err4) => {
                if (err4) {
                  console.log('Error uploading data: ', updateFile);
                  reject(Boom.expectationFailed(responseMessages.receipt.ERROR_UPLOAD_FILE_S3, err4));
                } else {
                  resolve({
                    message: responseMessages.receipt.SUCCESS_UPDATE_S3,
                    data: {}
                  });
                }
              });
            });
          });
        }
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}
const retryS3Upload = (bucketName, imageKey, orignalFile) => {
  return new Promise((resolve, reject) => {
    try {
      const s3 = new AWS.S3();
      s3.getObject({
        Bucket: bucketName,
        Key: imageKey
      }, (err, data) => {
        if (err) {
          reject(Boom.expectationFailed(responseMessages.receipt.ERROR_GETTING_FILE_S3, err));
        } else {
          console.log('success get s3 object');
          const imageStr = data.Body.toString('utf-8');
          const buf = new Buffer(imageStr, 'base64'); // eslint-disable-line
          fs.writeFileSync(orignalFile, buf, 'base64');
          console.log('successfuly write original file');
          Jimp.read(orignalFile, (err2, readImage) => {
            if (err2) {
              reject(err2);
            } else {
              resolve(readImage);
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

const attachStatusToDeals = async (dealArray) => {
  // const todayDate = new Date();
  const currentPeriod = await periodDB.getCurrentPeriod();
  const updatedDeals = dealArray.map((deal) => { // eslint-disable-line
    if (deal.rejected) {
      deal.status = 'Rejected';
    } else if (!deal.approved) {
      deal.status = 'Pending';
    } else if (checkIfCurrentPeriodExistsInDealPeriods(deal, currentPeriod)) {
      deal.status = 'Active';
    } else {
      deal.status = 'Inactive';
    }
    // else if (moment(deal.startDate).startOf('day') > todayDate) {
    //   deal.status = 'Upcoming';
    // } else if (moment(deal.endDate).endOf('day') < todayDate) {
    //   deal.status = 'Expired';
    // } else if (moment(deal.endDate).endOf('day') >= todayDate && moment(deal.startDate).startOf('day') <= todayDate) {
    //   deal.status = 'Active';
    // }
    return deal;
  });
  return updatedDeals;
}
module.exports.attachStatusToDeals = attachStatusToDeals;

const checkIfCurrentPeriodExistsInDealPeriods = (deal, currentPeriod) => {
  for (let i = 0; i < deal.periods.length; i++) {
    if (currentPeriod && deal.periods[i].description === currentPeriod.description) {
      return true;
    }
  }
  return false;
}
