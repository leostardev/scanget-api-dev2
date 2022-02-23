const Boom = require('boom');
const mongoose = require('mongoose');
const config = require('../../config');
const moment = require('moment');
const AWS = require('aws-sdk');
const Jimp = require('jimp');
const s3Zip = require('s3-zip');
const fs = require('fs');
const receiptDB = require('./receipt-model');
const responseMessages = require('../utils/messages');
const userDB = require('../user/user-model');
const walletDB = require('../wallet/wallet-model');
const dealDB = require('../deal/deal-model');
const notificationDB = require('../notification/notification-model'); // eslint-disable-line
const { sendNotification } = require('../utils/notification/notification');
const communityPointsDB = require('../community-points/community-points-model');
const { createAndUploadCsvToS3 } = require('../utils/upload-csv-to-s3');
const walletTransactionDB = require('../wallet-transaction/wallet-transaction-model');
const s3 = new AWS.S3();
const iotData = new AWS.IotData({
  endpoint: config.IOTPublishEndpoint,
  region: config.aws.region
});

module.exports.createReceipt = async (body, cognitoId) => {
  try {
    const user = await userDB.getUserByCognitoId(cognitoId, false);
    const receiptData = { ...body, family: user.family };
    const data = await receiptDB.createReceipt(receiptData);
    const thumbnails = [];
    for (let i = 0; i < data.image.length; i++) {
      thumbnails.push(data.image[i].replace('receipt', 'receipt-thumbnails'));
    }
    return {
      ...data._doc,
      thumbnails
    };
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERR_CREATING_RECEIPT);
  }
}

module.exports.updateReceipt = async (body, receiptId) => {
  try {
    const data = await receiptDB.updateReceipt(body, receiptId);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_UPDATING_RECEIPT);
  }
}

module.exports.deleteReceipt = async (receiptId, cognitoId) => {
  try {
    const user = await userDB.getUserByCognitoId(cognitoId, false);
    const receipt = await receiptDB.getReceiptById(receiptId);
    if (receipt.user.toString() !== user._id.toString()) {
      throw Boom.forbidden(responseMessages.SERVER.ERROR_UNAUTHORIZED);
    } else {
      await receiptDB.deleteReceipt(receiptId);
      return {
        message: responseMessages.receipt.SUCCESS_DELETE_RECEIPT
      };
    }
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_DELETING_RECEIPT);
  }
}

module.exports.getReceiptById = async (receiptId) => {
  try {
    const receipt = await receiptDB.getReceiptById(receiptId);
    return receipt;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_GET_RECEIPT_BY_ID);
  }
}

module.exports.getReceiptByUserId = async (userId) => {
  try {
    const receipts = await receiptDB.getReceiptByUserId(userId);
    return receipts;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_GET_RECEIPT_BY_ID);
  }
}
module.exports.getAllReceipts = async (body, isAdmin) => {
  try {
    const queryData = { ...body };
    if (body && body.minDate && body.maxDate) {
      queryData.minDate = moment(new Date(body.minDate)).startOf('day').utc().toDate();
      queryData.maxDate = moment(new Date(body.maxDate)).endOf('day').utc().toDate();
    }
    let results = await receiptDB.getAllReceipts(queryData, isAdmin);
    const responseData = {};
    if (isAdmin) {
      responseData.totalCount = results.total;
      responseData.allReceipts = results.data.map((receipt) => {
        const thumbnails = [];
        for (let i = 0; i < receipt.image.length; i++) {
          thumbnails.push(receipt.image[i].replace('receipt', 'receipt-thumbnails'));
        }
        return {
          ...receipt,
          thumbnails,
          downloadedAt: receipt.downloadedAt || 'Ready'
        };
      });
    } else {
      results = results.map((receipt) => {
        const thumbnails = [];
        for (let i = 0; i < receipt.image.length; i++) {
          thumbnails.push(receipt.image[i].replace('receipt', 'receipt-thumbnails'));
        }
        return {
          ...receipt,
          thumbnails
        };
      });
      return results;
    }
    return responseData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_GETTING_ALL_RECEIPTS, error);
  }
}

module.exports.approveReceipt = async (receiptId, body) => {
  try {
    const data = await receiptDB.updateReceipt({ ...body, processedAt: moment().utc().toDate() }, receiptId);
    // const meta = {
    //   receiptId: data._id
    // };
    // await sendNotification(data, 'receipt.approve', meta);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_APPROVING_RECEIPT);
  }
}

module.exports.rejectReceipt = async (receiptId, body) => {
  try {
    const data = await receiptDB.updateReceipt({ ...body, rejectedAt: moment().utc().toDate() }, receiptId);
    const meta = {
      receiptId: data._id
    };
    await sendNotification(data, 'receipt.reject', meta);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_REJECTING_RECEIPT, error);
  }
}

module.exports.revertReceiptApproval = async (receiptId) => {
  try {
    const updateData = {
      status: 'Pending',
      processedAt: null
    };
    const data = await receiptDB.updateReceipt(updateData, receiptId);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_REJECTING_RECEIPT, error);
  }
}

module.exports.revertReceiptAcceptance = async (receiptId) => {
  try {
    const receipt = await receiptDB.getReceiptById(receiptId, true)
    // update receipt status and necessary data
    const updateData = {
      status: 'Processing',
      acceptedAt: null,
      deals: [],
      receipt_id: null,
      products: [],
      savedAmount: 0,
      amountSpent: 0,
      retailer_info: {},
      receipt_date: null,
      receipt_time: null,
    };
    const updatedReceipt = await receiptDB.updateReceipt(updateData, receiptId);
    // delete Notification regarding receipt acceptance
    const deletedNotification = await notificationDB.deleteNotification({
      $or: [{ 'meta.receiptId': receiptId }, { 'meta.receiptId': mongoose.Types.ObjectId(receiptId) }]
    })
    console.log(deletedNotification);
    // calculate total points gained from products
    let totalCommunityPoints = 0;
    receipt.products.map(product => {
      if (product.points && product.points > 0) {
        totalCommunityPoints += product.points;
      }
      return product;
    })
    // update wallet ammount and community points accordingly
    const updatedWallet = await walletDB.updateAmountOnReceiptRevertFromAccepted(receipt.user._id, receipt.amountSpent, receipt.savedAmount, totalCommunityPoints);
    console.log(updatedWallet);
    // delete community points accordingly
    const deletedCommunityPoints = await communityPointsDB.deleteCommunityPoints({
      $or: [{ 'meta.receiptId': receiptId }, { 'meta.receiptId': mongoose.Types.ObjectId(receiptId) }]
    })
    console.log(deletedCommunityPoints);
    //decrement availed deals count from deals and update user availed deals
    const user = await userDB.findByMongoId(receipt.user._id);
    let availedDeals = [];
    const $promises = [];

    for (let i = 0; i < receipt.deals.length; i++) {
      $promises.push(dealDB.decrementAvailedDealCount(receipt.deals[i]));
    }
    await Promise.all($promises);
    // update user availed deals details
    availedDeals = user.availedDeals.filter(deal => {
      for (let i = 0; i < receipt.deals.length; i++) {
        if (deal.toString === receipt.deals[i].toString()) {
          return false
        }
      }
      return true;
    });
    console.log(user.availedDeals)
    console.log(receipt.deals)
    console.log('User Availed Deals after filter')
    console.log(availedDeals)
    user.availedDeals = availedDeals;
    const updatedUser = await userDB.updateUserDetails(user, user.cognitoId);
    console.log(updatedUser);
    //  delete wallet transaction related to this receipt
    const deletedWalletTransaction = await walletTransactionDB.deleteTransaction({
      $or: [{ 'meta.receiptId': receiptId }, { 'meta.receiptId': mongoose.Types.ObjectId(receiptId) }]
    })
    console.log(deletedWalletTransaction);
    return updatedReceipt;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_REJECTING_RECEIPT, error);
  }
}

module.exports.acceptReceipt = async (receiptId, body, isBulkReceipts) => {
  try {
    const receipt = await receiptDB.getReceiptById(receiptId);
    if (receipt.status === 'Accepted') {
      receipt.acceptStatus = 'AlreadyAccepted';
      return receipt;
    }
    const receiptUpdateData = {
      ...body
    };
    receiptUpdateData.receipt_date = moment(new Date(body.receipt_date)).startOf('day').utc(true);
    receiptUpdateData.deals = receiptUpdateData.deals.map(item => item.deal);
    receiptUpdateData.acceptedAt = moment().utc().toDate();
    const data = await receiptDB.updateReceipt(receiptUpdateData, receiptId);
    data.acceptStatus = 'Accepted';
    const meta = {
      receiptId: data._id
    };
    const modifiedData = { ...data };
    const user = await userDB.findByMongoId(data.user._id);
    if (body.deals && body.deals.length > 0) {
      modifiedData.message = `. The amount saved from the ${body.deals.length} products in deals was ${parseFloat(body.savedAmount).toFixed(2)}€. For more details, please review the receipt in your wallet`;
      const availedDeals = user.availedDeals;
      const $promises = [];
      for (let i = 0; i < body.deals.length; i++) {
        // if (!availedDeals.includes(body.deals[i].toString())) {
        availedDeals.push(body.deals[i]);
        // }
        $promises.push(dealDB.incrementAvailedDealCount(body.deals[i]));
      }
      user.availedDeals = availedDeals;
      await Promise.all($promises);
    } else {
      // modifiedData.message = ', but unfortunately no deals were found';
      modifiedData.message = '';
    }
    user.hasUploadedReceipt = true;
    await userDB.updateUserDetails(user, user.cognitoId);
    modifiedData.receipt_date = moment(modifiedData.receipt_date).format('DD-MM-YYYY');

    await sendNotification(modifiedData, 'receipt.accept', meta);
    await walletDB.updateAmountOnReceiptApproved(data.user._id, body.amountSpent, body.savedAmount);
    const allProducts = body.products;
    const $promises = [];
    let totalPoints = 0;
    for (let i = 0; i < allProducts.length; i++) {
      if (allProducts[i].community && allProducts[i].description && allProducts[i].points && allProducts[i].quantity) {
        const communityPoints = {
          family: receipt.family,
          points: allProducts[i].points,
          action: 'Submit',
          source: body.retailer_info.shop,
          info: allProducts[i].description,
          quantity: allProducts[i].quantity,
          date: body.receipt_date,
          community: allProducts[i].community,
          meta: {
            receiptId
          }
        };
        totalPoints += parseInt(allProducts[i].points, 10);
        $promises.push(communityPointsDB.createCommunityPoints(communityPoints));
      }
    }
    console.log(totalPoints)
    await Promise.all($promises);
    await walletDB.submitPointsInFamilyWallet(receipt.family, totalPoints);
    if (body.savedAmount > 0) {
      const receiptDeals = await dealDB.getDealsByMultipleIds(body.deals.map(d => mongoose.Types.ObjectId(d.deal)))
      const walletTrasaction = {
        dType: 'receipt.accept',
        description: 'Amount saved from receipt acceptance',
        meta: {
          receiptId: receiptId,
          deals: receiptDeals.map(d => {
            return {
              title: d.title,
              _id: d._id
            }
          }),
          shop: body.retailer_info ? body.retailer_info.shop : ''
        },
        user: receipt.user,
        family: receipt.family,
        amount: body.savedAmount,
        isCredited: true,
        createdAt: body.receipt_date
      }
      await walletTransactionDB.createWalletTransaction(walletTrasaction);
    }
    return data;
  } catch (error) {
    if (isBulkReceipts) {
      return {
        _id: receiptId,
        acceptStatus: 'Failed'
      };
    }
    throw Boom.forbidden(responseMessages.receipt.ERROR_ACCEPTING_RECEIPT, error);
  }
}
module.exports.updateImage = (incomingFile, rotate = true) => {
  return new Promise((resolve, reject) => {
    const orignalFile = `/tmp/sng-original.${Date.now()}.jpeg`;
    let targetFile = `/tmp/sng.${Date.now()}.jpeg`;
    const s3 = new AWS.S3();
    s3.getObject(incomingFile, async (err, data) => {
      if (err) {
        reject(Boom.expectationFailed(responseMessages.receipt.ERROR_GETTING_FILE_S3, err));
      } else {
        if (data.Metadata['image-fixed'] === 'true') {
          reject(Boom.forbidden(responseMessages.receipt.ERROR_IMAGE_ALREADY_FIXED));
        }
        const imageStr = data.Body.toString('utf-8');
        const buf = new Buffer(imageStr, 'base64'); // eslint-disable-line

        await fs.writeFileSync(orignalFile, buf, 'base64');

        Jimp.read(orignalFile, async (err2, image) => {
          console.log(image);
          if (err2) {
            reject(Boom.expectationFailed(responseMessages.receipt.ERROR_JIMP, err));
          }
          if (rotate) {
            await image.rotate(-90).writeAsync(targetFile); // save
          } else {
            targetFile = orignalFile;
          }
          fs.readFile(targetFile, (err3, fileData) => {
            if (err3) {
              console.log(err3);
              reject(Boom.expectationFailed(responseMessages.receipt.ERROR_FS, err3));
            }
            const updateFile = {
              ...incomingFile,
              Body: fileData,
              ContentEncoding: 'base64',
              ContentType: 'image/jpeg',
              Metadata: {
                'image-fixed': 'true',
              }
            };

            s3.putObject(updateFile, (err4) => {
              if (err4) {
                console.log('Error uploading data: ', updateFile);
                reject(Boom.expectationFailed(responseMessages.receipt.ERROR_UPLOAD_FILE_S3, err2));
              } else {
                resolve({
                  message: responseMessages.receipt.SUCCESS_UPDATE_S3,
                  data: incomingFile
                });
              }
            });
          });
        });
      }
    });
  });
}

module.exports.exportReceiptsToCsv = async (body) => {
  try {
    const queryData = { ...body };
    if (body && body.minDate && body.maxDate) {
      queryData.minDate = moment(new Date(body.minDate)).startOf('day').utc().toDate();
      queryData.maxDate = moment(new Date(body.maxDate)).endOf('day').utc().toDate();
    }
    let data = await receiptDB.getAllReceiptsForCSV(queryData, true);
    data = data.map((receipt) => {
      const newData = {
        _id: receipt._id.toString(),
        userId: receipt.user._id.toString(),
        receipt_date: moment(receipt.receipt_date).format('DD MMM,YYYY'),
        uploadedAt: moment(receipt.createdAt).format('DD MMM,YYYY'),
        status: receipt.status,
        isDeleted: receipt.active ? false : true
      };
      return newData;
    });
    const s3UploadData = await createAndUploadCsvToS3(data, `receipt-csv/${Date.now()}/receipts.csv`);
    console.log(s3UploadData);
    return s3UploadData;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_GETTING_ALL_RECEIPTS, error);
  }
}

module.exports.zipAndUploadToS3 = (data) => {
  return new Promise((resolve, reject) => { // eslint-disable-line
    const region = 'eu-west-1';
    const bucket = config.assetsS3Bucket;
    const folder = 'receipt';
    const files = data.keys;
    const zipFileName = `receipt/${Date.now()}.zip`;

    try {
      console.log(folder);
      console.log(files);
      const body = s3Zip.archive({ region, bucket }, folder, files);
      const zipParams = { params: { Bucket: bucket, Key: zipFileName } };
      const zipFile = new AWS.S3(zipParams);
      zipFile.upload({ Body: body })
        .on('httpUploadProgress', (evt) => { console.log(evt); })
        .send((e, r) => {
          if (e) {
            console.log(e);
            return reject(e);
          }
          console.log(r);
          return resolve(r);
        });
    } catch (e) {
      console.log(e);
      return reject(e);
    }
  });
}

const checkFileExistanceOnS3 = (key, folder) => {
  const params = {
    Bucket: config.assetsS3Bucket,
    Key: `${folder}/${key}`
  }
  return new Promise((resolve, reject) => {
    try {
      s3.headObject(params, function (err) {
        if (err && err.code === 'NotFound') {
          resolve({
            key,
            status: 'Not Exists on S3 bucket',
            receiptId: key ? key.split('_')[0] : '',
            available: false
          })
        } else {
          resolve({
            key,
            available: true
          })
        }
      })
    } catch (error) {
      reject(Boom.forbidden(responseMessages.receipt.ERROR_GETTING_FILE_S3));
    }
  })
}

module.exports.checkFileExistanceOnS3 = checkFileExistanceOnS3;

// const createAndUploadCsvToS3 = (csvData, key) => {
//   return new Promise((resolve, reject) => {
//     jsonexport(csvData, (err, csv) => {
//       if (err) {
//         reject(err);
//       }
//       const csvFileData = {
//         Bucket: `${config.assetsS3Bucket}`,
//         Body: csv,
//         Key: key,
//         ContentType: 'text/csv'
//       };
//       const s3 = new AWS.S3();
//       s3.putObject(csvFileData, (err4) => {
//         if (err4) {
//           console.log('Error uploading data: ', csvFileData);
//           reject(Boom.expectationFailed(responseMessages.receipt.ERROR_UPLOAD_FILE_S3, err4));
//         } else {
//           resolve(csvFileData);
//         }
//       });
//     });
//   });
// }

// module.exports.createAndUploadCsvToS3 = createAndUploadCsvToS3;

module.exports.getReceiptsSummary = async (month, year, queryParams) => {
  try {
    const startDate = moment(new Date(year, month - 1, 2)).utc().startOf('day');
    const endDate = moment(startDate).endOf('month').toDate();
    const query = {
      receipt_date: {
        // $gte: startDate.toDate, 
        $lte: endDate
      }
    };
    console.log(query);
    const summary = await receiptDB.getReceiptsGroupByFamilyId(query, queryParams);
    const usersQuery = {
      status: 'Accepted',
      savedAmount: {
        $gt: 0
      },
      user: { $in: summary.data.map(summaryItem => mongoose.Types.ObjectId(summaryItem.family.familyAdmin)) },
      receipt_date: {
        $gte: startDate.add(1, 'month').utc().startOf('month').toDate(),
        $lte: moment().toDate()
      }
    }
    console.log(usersQuery);
    const currentMonthSavedAmounts = await receiptDB.getCurrentMonthSavedAmounts(usersQuery)
    console.log(currentMonthSavedAmounts);
    summary.data = summary.data.map(d => {
      let payableAmount = d.outstandingBalance;
      if (currentMonthSavedAmounts[`${d.family._id}`]) {
        const previousMonthsAmount = d.outstandingBalance - currentMonthSavedAmounts[`${d.family._id}`];
        payableAmount = previousMonthsAmount < 0 ? 0 : previousMonthsAmount;
      }
      return {
        ...d,
        outstandingBalance: +parseFloat(d.outstandingBalance.toFixed(2)),
        amountSpent: +parseFloat(d.amountSpent.toFixed(2)),
        amountSaved: +parseFloat(d.amountSaved.toFixed(2)),
        payableAmount: +parseFloat(payableAmount.toFixed(2))
      }
    })
    return summary;
  } catch (error) {
    throw Boom.internal(responseMessages.receipt.ERROR_GET_RECEIPT_BY_ID, error);
  }
}

module.exports.getReceiptsSummaryCSV = async (month, year, queryParams) => {
  try {
    const startDate = moment(new Date(year, month - 1, 2)).utc().startOf('day');
    const endDate = moment(startDate).endOf('month').toDate();
    const query = {
      receipt_date: {
        // $gte: startDate.toDate, 
        $lte: endDate
      }
    };
    console.log(query);
    let summary = await receiptDB.getReceiptsGroupByFamilyIdForCSV(query, queryParams);
    const usersQuery = {
      status: 'Accepted',
      savedAmount: {
        $gt: 0
      },
      user: { $in: summary.map(summaryItem => mongoose.Types.ObjectId(summaryItem.family.familyAdmin)) },
      receipt_date: {
        $gte: startDate.add(1, 'month').utc().startOf('month').toDate(),
        $lte: moment().toDate()
      }
    }
    console.log(usersQuery);
    const currentMonthSavedAmounts = await receiptDB.getCurrentMonthSavedAmounts(usersQuery)
    console.log(currentMonthSavedAmounts);
    summary = summary.map(item => {
      let payableAmount = item.outstandingBalance;
      if (currentMonthSavedAmounts[`${item.family._id}`]) {
        const previousMonthsAmount = item.outstandingBalance - currentMonthSavedAmounts[`${item.family._id}`];
        payableAmount = previousMonthsAmount < 0 ? 0 : previousMonthsAmount;
      }
      return {
        totalReceipts: item.totalReceipts,
        family: {
          _id: item.family._id.toString(),
          accountDetails: item.family.accountDetails,
          familyAdmin: item.family.familyAdmin.toString(),
          wallet: item.family.wallet.toString(),
        },
        amountSaved: parseFloat(item.amountSaved).toFixed(2),
        amountSpent: parseFloat(item.amountSpent).toFixed(2),
        outstandingBalance: parseFloat(item.outstandingBalance).toFixed(2),
        payableAmount: parseFloat(payableAmount).toFixed(2),
      }
    })
    const s3UploadData = await createAndUploadCsvToS3(summary, `receipts-summary-csv/${Date.now()}/receipts-summary.csv`);
    console.log(s3UploadData);
    return s3UploadData;
  } catch (error) {
    console.log(error)
    throw Boom.internal(responseMessages.receipt.ERROR_UPLOAD_RECEIPT_SUMMARY, error);
  }
}

module.exports.uploadReceiptThumbnail = (bucketName, imageKey, thumbnailKey) => {
  return new Promise((resolve, reject) => {
    try {
      // const orignalFile = `/tmp/${imageKey}`;
      // const targetFile = `/tmp/${thumbnailKey}`;
      const orignalFile = `/tmp/sng-receipt-original.${Date.now()}.jpeg`;
      const targetFile = `/tmp/sng-receipt.${Date.now()}.jpeg`;
      const s3 = new AWS.S3();
      s3.getObject({
        Bucket: bucketName,
        Key: imageKey
      }, async (err, data) => {
        if (err) {
          reject(Boom.expectationFailed(responseMessages.receipt.ERROR_GETTING_FILE_S3, err));
        } else {
          console.log('success get s3 object');
          const imageStr = data.Body.toString('utf-8');
          const buf = new Buffer(imageStr, 'base64'); // eslint-disable-line
          await fs.writeFileSync(orignalFile, buf, 'base64');
          console.log('successfuly write original file');
          Jimp.read(orignalFile, async (err2, image) => {
            console.log(image);
            if (err2) {
              reject(Boom.expectationFailed(responseMessages.receipt.ERROR_JIMP, err));
            }
            await image.rotate(-90).resize(200, 200).writeAsync(targetFile); // save

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
      reject(error);
    }
  });
}

module.exports.downloadReceiptImages = async (body, userId) => {
  try {
    let query = {
      active: true
    };
    let allReceipts = [];
    const downloadableKeys = [];
    let missingReceiptImages = [];
    let { month, year } = body;
    if (month && year) {
      const startDate = moment([year, month - 1]).toDate();
      const endDate = moment(startDate).endOf('month').toDate();
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (body.status) {
      query.status = body.status
    }
    let receiptIds = body.receiptIds && body.receiptIds.length > 0 ? [...body.receiptIds] : [];
    receiptIds = receiptIds.filter(r => r !== '');
    if (receiptIds && receiptIds.length > 0) {
      let missingReceiptsData = await validateReceiptIds(receiptIds)
      missingReceiptImages = [...missingReceiptsData]
      query._id = { $in: receiptIds }
    }

    if (body.downloadAllReady) {
      query = {
        active: true,
        status: 'Processing',
        downloadedAt: { $exists: false }
      }
    }
    allReceipts = await receiptDB.getMonthlyReceiptsForImages(query);
    const allFiles = [];
    allReceipts.map(item => {
      item.image.map(image => {
        allFiles.push(image.split(`${config.s3BucketCDN}/receipt/`)[1])
        return image;
      })
      return item;
    })

    const $promises = [];
    for (let i = 0; i < allFiles.length; i++) {
      $promises.push(checkFileExistanceOnS3(allFiles[i], 'receipt'))
    }
    const keyExistance = await Promise.all($promises);

    for (let i = 0; i < keyExistance.length; i++) {
      if (keyExistance[i].available) {
        downloadableKeys.push(keyExistance[i].key)
      } else {
        missingReceiptImages.push(keyExistance[i])
      }
    }

    if (downloadableKeys.length === 0) {
      let params = {
        topic: `receiptsZip_${userId}`,
        payload: JSON.stringify({
          missingReceiptImages,
          error: true,
          errorMessage: 'No downloadable receipt images'
        }),
        qos: 0
      };
      iotData.publish(params, function (err, publishedData) {
        if (err) {
          console.log(`Something went wrong while sending receipt zip url: ${err}`);
          console.log(err);
          return err;
        }
        return publishedData
      });
    } else {
      await updateReceiptdonwloadDateFromImageKeys(downloadableKeys)
      const uploadReceiptFileName = await receiptDB.uploadZipToS3(downloadableKeys);
      const responseData = {
        zipurl: `${config.s3BucketCDN}/${uploadReceiptFileName}`,
        missingReceiptImages
      };
      let params = {
        topic: `receiptsZip_${userId}`,
        payload: JSON.stringify(responseData),
        qos: 0
      };
      iotData.publish(params, function (err, publishedData) {
        if (err) {
          console.log(`Something went wrong while sending receipt zip url: ${err}`);
          console.log(err);
          return err;
        }
        return publishedData
      });
    }
  } catch (error) {
    console.log(error)
    iotData.publish({
      topic: `receiptsZip_${userId}`,
      payload: JSON.stringify({ error: true, errorMessage: error.message }),
      qos: 0
    }, function (err, publishedData) {
      if (err) {
        console.log(`Something went wrong while sending error report: ${err}`);
        console.log(err);
        return err;
      }
      return publishedData
    });
    throw Boom.internal(responseMessages.receipt.ERROR_DOWNLOADING_MONTHLY_RECEIPTS);
  }
}

const updateReceiptdonwloadDateFromImageKeys = async (receiptImageKeys) => {
  try {
    let receiptIds = [];
    for (let i = 0; i < receiptImageKeys.length; i++) {
      receiptIds.push(receiptImageKeys[i].split('_')[0]); // extract receipt id from image keys e.g: 5ebbd33be2e7d128139e723f_20200513-0201_2.jpeg
    }
    receiptIds = receiptIds.filter((item, pos) => { // remove duplicate receipt ids
      return receiptIds.indexOf(item) === pos;
    })
    const $promises = [];
    for (let j = 0; j < receiptIds.length; j++) {
      $promises.push(receiptDB.updateReceiptByQuery({ _id: receiptIds[j], downloadedAt: { $exists: false } }, { downloadedAt: moment().utc().toDate() }))
    }
    const data = await Promise.all($promises)
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.receipt.ERROR_UPDATING_RECEIPT, error);
  }
}

module.exports.updateReceiptdonwloadDateFromImageKeys = updateReceiptdonwloadDateFromImageKeys;

const validateReceiptIds = (receiptIds) => {
  return new Promise(async (resolve) => {
    const missingReceiptIds = [];
    const $promises = [];

    for (let i = 0; i < receiptIds.length; i++) {
      $promises.push(receiptDB.getReceiptById(receiptIds[i], false))
    }
    const receiptsData = await Promise.all($promises)
    for (let k = 0; k < receiptsData.length; k++) {
      if (!receiptsData[k]) {
        missingReceiptIds.push({
          key: '',
          status: 'Receipt with given id doesnot exists',
          receiptId: receiptIds[k],
          available: false
        })
      }
    }
    resolve(missingReceiptIds)
  })
}

// async acceptBulkReceipts(body) {
//   try {
//     const { url } = body;
//     const targetFile = `/tmp/sng.${Date.now()}.jpeg`;
//     const s3 = new AWS.S3();
//     return new Promise((resolve, reject) => {
//       s3.getObject(targetFile, async (err, data) => {
//         if (err) {
//           reject(Boom.expectationFailed(responseMessages.receipt.ERROR_GETTING_FILE_S3, err));
//         } else {
//           console.log(data);
//         }
//       });
//     });
//     // const data = await receiptDB.updateReceipt(body);
//     // return data;
//   } catch (error) {
//     throw Boom.forbidden(responseMessages.receipt.ERROR_APPROVING_RECEIPT);
//   }
// }
