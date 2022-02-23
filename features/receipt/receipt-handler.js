const Boom = require('boom');
const mongoose = require('mongoose');
const receiptCtrl = require('./receipt-controller');
const config = require('../../config');
const { createReceiptSchema, updateReceiptSchema, deleteReceiptSchema, receiptByUserIdSchema, getAllReceiptSchema, exportReceiptsToCsvSchema, approveReceiptSchema, acceptReceiptSchema, acceptBulkReceiptSchema, bulkReceiptDealsSchema, rejectReceiptSchema, acceptReceiptProductsSchema, acceptReceiptDealsSchema, acceptReceiptRetailerSchema, checkReceiptImageData, zipReceiptsSchema } = require('../utils/validation');
const userCtrl = require('../user/user-controller');
const responseMessages = require('../utils/messages');
const clientSchema = require('../client/client-schema'); // eslint-disable-line
const receiptDB = require('./receipt-model');
const dealDB = require('../deal/deal-model');
const productDB = require('../product/product-model');
const retailerDB = require('../retailer/retailer-model');
const categoryDB = require('../category/category-model');

module.exports.createReceipt = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    const validationError = createReceiptSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.createReceipt(body, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateReceipt = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { receiptId } = params;
    const validationError = updateReceiptSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.updateReceipt(body, receiptId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.deleteReceipt = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { receiptId } = params;
    const validationError = deleteReceiptSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.deleteReceipt(receiptId, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllReceipts = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    let data;
    const validationError = getAllReceiptSchema(body);
    if (validationError) {
      throw Boom.badRequest('Invalid search parameters');
    }
    if (currentUser.role === 'admin') {
      data = await receiptCtrl.getAllReceipts(body, true);
    } else {
      if (!body.user) {
        throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
      }
      const user = await userCtrl.getByUserId(body.user);
      if (!user || user.cognitoId !== currentUser.cognitoId) {
        throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
      } else {
        data = await receiptCtrl.getAllReceipts(body);
      }
    }
    res.json({
      success: true,
      data
    });
  } catch (e) {
    console.log(e)
    return next(e);
  }
}

module.exports.approveReceipt = async (req, res, next) => {
  try {
    const { body, params } = req;
    const validationError = approveReceiptSchema({ ...params, ...body });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.approveReceipt(params.receiptId, body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.rejectReceipt = async (req, res, next) => {
  try {
    const { body, params } = req;
    const validationError = rejectReceiptSchema({ ...params, ...body });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.rejectReceipt(params.receiptId, body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.revertReceiptApproval = async (req, res, next) => {
  try {
    const { params } = req;
    const data = await receiptCtrl.revertReceiptApproval(params.receiptId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.revertReceiptAcceptance = async (req, res, next) => {
  try {
    const { params } = req;
    const data = await receiptCtrl.revertReceiptAcceptance(params.receiptId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.acceptReceipt = async (req, res, next) => {
  try {
    const { body, params } = req;
    const { receiptId } = params;
    let validationError = acceptReceiptSchema({ ...body, ...params });
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    for (let i = 0; i < body.products.length; i++) {
      validationError = acceptReceiptProductsSchema(body.products[i]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }

    for (let k = 0; k < body.deals.length; k++) {
      validationError = acceptReceiptDealsSchema(body.deals[k]);
      if (validationError) {
        throw Boom.badRequest(validationError);
      }
    }
    validationError = acceptReceiptRetailerSchema(body.retailer_info);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.acceptReceipt(receiptId, body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.updateImage = async (req, res, next) => {

  try {
    const { body } = req;
    const validationError = checkReceiptImageData(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { bucket, key, rotate } = body;
    const incomingFile = {
      Bucket: bucket,
      Key: key
    };
    const data = await receiptCtrl.updateImage(incomingFile, rotate);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getReceiptById = async (req, res, next) => {
  try {
    const { params } = req;
    const { receiptId } = params;
    const validationError = deleteReceiptSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.getReceiptById(receiptId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.acceptBulkReceipts = async (req, res, next) => {
  try {
    const { body } = req;
    // const { receiptId } = body;
    let validationError;
    validationError = acceptBulkReceiptSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { receipts } = body;
    const validReceipts = [];
    const invalidReceipts = [];
    for (let m = 0; m < receipts.length; m++) {
      validationError = acceptReceiptSchema(receipts[m]);
      if (validationError) {
        // throw Boom.badRequest(validationError);
        invalidReceipts.push({ ...receipts[m], validationError })
        continue;
      }

      const checkReceiptId = await receiptDB.getReceiptById(receipts[m].receiptId);
      if (!checkReceiptId) {
        // throw Boom.forbidden('No Receipt exists with the given Id');
        invalidReceipts.push({ ...receipts[m], validationError: 'No Receipt exists with the given Id' })
        continue;
      }
      for (let i = 0; i < receipts[m].products.length; i++) {
        validationError = acceptReceiptProductsSchema(receipts[m].products[i]);
        if (validationError) {
          // throw Boom.badRequest(validationError);
          invalidReceipts.push({ ...receipts[m], validationError })
          continue;
        }
        if (receipts[m].products[i].product) {
          const checkProductId = await productDB.getProductsById(receipts[m].products[i].product);
          if (!checkProductId) {
            // throw Boom.forbidden(`Product with Id ${receipts[m].products[i].product} doesnot exists`);
            invalidReceipts.push({ ...receipts[m], validationError: `Product with Id ${receipts[m].products[i].product} doesnot exists` })
            continue;
          }
          const checkCategoryId = await categoryDB.getACategoryById(receipts[m].products[i].category);
          if (!checkCategoryId) {
            // throw Boom.forbidden(`Category with Id ${receipts[m].products[i].category} doesnot exists`);
            invalidReceipts.push({ ...receipts[m], validationError: `Category with Id ${receipts[m].products[i].category} doesnot exists` })
            continue;
          }
        }
      }

      for (let k = 0; k < receipts[m].deals.length; k++) {
        if (receipts[m].deals[k] === null) {
          // throw Boom.foßrbidden('Deal Id cant be null');
          invalidReceipts.push({ ...receipts[m], validationError: 'Deal Id cant be null' })
          continue;
        }
        validationError = bulkReceiptDealsSchema(receipts[m].deals[k]);
        if (validationError) {
          // throw Boom.badRequest(validationError);
          invalidReceipts.push({ ...receipts[m], validationError })
          continue;
        }
        const checkDealId = await dealDB.getDealByIdForValidation(receipts[m].deals[k].deal);
        if (!checkDealId) {
          // throw Boom.forbidden(`Deal with Id ${receipts[m].deals[k].deal} doesnot exists`);
          invalidReceipts.push({ ...receipts[m], validationError: `Deal with Id ${receipts[m].deals[k].deal} doesnot exists` })
          continue;
        }
      }
      validationError = acceptReceiptRetailerSchema(receipts[m].retailer_info);
      if (validationError) {
        // throw Boom.badRequest(validationError);
        invalidReceipts.push({ ...receipts[m], validationError })
        continue;
      }
      const checkRetailerId = await retailerDB.getRetailerById(receipts[m].retailer_info.retailer);
      if (!checkRetailerId) {
        // throw Boom.forbidden(`Retailer with Id ${receipts[m].retailer_info.retailer} doesnot exists`);
        invalidReceipts.push({ ...receipts[m], validationError: `Retailer with Id ${receipts[m].retailer_info.retailer} doesnot exists` })
        continue;
      }
      validReceipts.push(receipts[m])
    }
    const $promises = [];
    for (let p = 0; p < validReceipts.length; p++) {
      $promises.push(receiptCtrl.acceptReceipt(receipts[p].receiptId, receipts[p], true));
    }
    const data = await Promise.all($promises);
    const formattedResponse = {
      accepted: [],
      alreadyAccepted: [],
      failed: [
        ...invalidReceipts
      ]
    };
    data.map((receipt) => { // eslint-disable-line
      if (receipt.acceptStatus === 'Accepted') {
        formattedResponse.accepted.push(receipt);
      } else if (receipt.acceptStatus === 'AlreadyAccepted') {
        formattedResponse.alreadyAccepted.push(receipt);
      } else if (receipt.acceptStatus === 'Failed') {
        formattedResponse.failed.push(receipt);
      }
    });

    res.json({
      success: true,
      data: formattedResponse
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getReceiptId = (req, res, next) => {
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

module.exports.getReceiptsSummary = async (req, res, next) => {
  try {
    const { params, queryParams } = req;
    const data = await receiptCtrl.getReceiptsSummary(params.month, params.year, queryParams);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getReceiptsSummaryCSV = async (req, res, next) => {
  try {
    const { params, queryParams } = req;
    const receiptSummaryCSV = await receiptCtrl.getReceiptsSummaryCSV(params.month, params.year, queryParams);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${receiptSummaryCSV.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}
// module.exports.s3ReceiptUploadTrigger = async (req, res, next) => {
//   try {
//     console.log(JSON.stringify(req, null, 2));
//     // get s3 bucket name
//     const bucketName = config.assetsS3Bucket;
//     console.log(bucketName);
//     // get image key
//     const imageKey = event.Records[0].s3.object.key;
//     console.log(imageKey);
//     const thumbnailKey = imageKey.replace('receipt', 'receipt-thumbnails');
//     console.log(thumbnailKey);
//     await receiptCtrl.uploadReceiptThumbnail(bucketName, imageKey, thumbnailKey);
//     console.log('Successfully added receipt thumbnail');
//     // resize using sharp
//     // upload image to deal-thumb
//     res.json({
//       success: true,
//       data: {}
//     });
//   } catch (e) {
//     console.log(e);
//     return next(e);
//   }
// }

module.exports.zipReceipts = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = zipReceiptsSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const { keys } = body;
    const $promises = [];
    for (let i = 0; i < keys.length; i++) {
      $promises.push(receiptCtrl.checkFileExistanceOnS3(keys[i], 'receipt'))
    }
    const keyExistance = await Promise.all($promises);
    const downloadableKeys = [];
    const missingReceiptImages = [];
    for (let i = 0; i < keyExistance.length; i++) {
      if (keyExistance[i].available) {
        downloadableKeys.push(keyExistance[i].key)
      } else {
        missingReceiptImages.push(keyExistance[i])
      }

    }
    await receiptCtrl.updateReceiptdonwloadDateFromImageKeys(downloadableKeys);
    const receiptZip = await receiptCtrl.zipAndUploadToS3({ keys: downloadableKeys });
    res.json({
      success: true,
      data: { zipurl: `${config.s3BucketCDN}/${receiptZip.Key}`, missingReceiptImages }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.exportReceiptsToCsv = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = exportReceiptsToCsvSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const receiptCsv = await receiptCtrl.exportReceiptsToCsv(body);
    res.json({
      success: true,
      data: { csvFileUrl: `${config.s3BucketCDN}/${receiptCsv.Key}` }
    });
  } catch (e) {
    return next(e);
  }
}
// module.exports.acceptBulkReceipts= async (req, res, next) =>  {
//   
// await connectToDatabase();
//   
//   try {
//     const { body } = req;
//     const validationError = bulkReceiptAcceptSchema(body);
//     if (validationError) {
//       throw Boom.badRequest(validationError);
//     }
//     const data = await receiptCtrl.acceptBulkReceipts(body);
//         res.json({
// success: true,
//   data
//     });
//   } catch (e) {
//     return next(e);
//   }
// 
// }

module.exports.getReceiptByUserId = async (req, res, next) => {
  try {
    const { params } = req;
    const { userId } = params;
    const validationError = receiptByUserIdSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await receiptCtrl.getReceiptByUserId(userId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.downloadReceiptImages = async (req, res, next) => {
  try {
    const { body, currentUser } = req;
    if (body.receiptIds) {
      for (let i = 0; i < body.receiptIds.length; i++) {
        const isValid = mongoose.Types.ObjectId.isValid(body.receiptIds[i]);
        if (!isValid) {
          throw Boom.badRequest(`Invalid receipt id provided, ${body.receiptIds[i]}`);
        }
      }
    }
    res.json({
      success: true,
      data: {
        message: 'Your request for downloading receipt image has been received, will notify you when it is done',
        subsciptionEndpoint: `receiptsZip_${currentUser.userId}`
      }
    });
    await receiptCtrl.downloadReceiptImages(body, currentUser.userId);
  } catch (e) {
    return next(e);
  }
}
