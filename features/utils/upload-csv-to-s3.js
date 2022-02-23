const jsonexport = require('jsonexport');
const config = require('../../config');
const responseMessages = require('./messages');
const AWS = require('aws-sdk');
const Boom = require('boom');

module.exports.createAndUploadCsvToS3 = (csvData, key) => {
  return new Promise((resolve, reject) => {
    jsonexport(csvData, (err, csv) => {
      if (err) {
        reject(err);
      }
      const csvFileData = {
        Bucket: `${config.assetsS3Bucket}`,
        Body: csv,
        Key: key,
        ContentType: 'text/csv'
      };
      const s3 = new AWS.S3();
      s3.putObject(csvFileData, (err4) => {
        if (err4) {
          console.log('Error uploading data: ', csvFileData);
          reject(Boom.expectationFailed(responseMessages.receipt.ERROR_UPLOAD_FILE_S3, err4));
        } else {
          resolve(csvFileData);
        }
      });
    });
  });
};
