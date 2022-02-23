const nodemailer = require('nodemailer');
const config = require('../../config');

module.exports.sendEmail = async (data) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      secureConnection: false,
      port: 587,
      tls: {
        ciphers: 'SSLv3'
      },
      auth: {
        user: config.outlookId,
        pass: config.outlookPass
      }
    });

    const mailOptions = {
      from: config.outlookId,
      to: config.outlookId,
      subject: data.subject,
      text: data.text,
      replyTo: data.email
    };

    transporter.sendMail(mailOptions, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

module.exports.sendCredsToClient = async (data) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      secureConnection: false,
      port: 587,
      tls: {
        ciphers: 'SSLv3'
      },
      auth: {
        user: config.outlookId,
        pass: config.outlookPass
      }
    });

    const mailOptions = {
      from: config.outlookId,
      to: data.email,
      subject: 'ScanNGet Client Account Created',
      text: `Congratulations, your account has been successfully created on ScanNGet Client Panel, You can log in to ${config.clientPanelUrl} with the following credentials:\n\nUsername: ${data.email}\nPassword: ${data.password}\n\nThanks.\nRegards,\nScanNGet Support`,
      replyTo: config.outlookId
    };

    transporter.sendMail(mailOptions, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

module.exports.sendCredsToClientUser = async (data) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      secureConnection: false,
      port: 587,
      tls: {
        ciphers: 'SSLv3'
      },
      auth: {
        user: config.outlookId,
        pass: config.outlookPass
      }
    });

    const mailOptions = {
      from: config.outlookId,
      to: data.email,
      subject: 'ScanNGet Client User Account Created',
      text: `Congratulations, your account has been added to ScanNGet Client Panel by ${data.clientName}, You can log in to ${config.clientPanelUrl} with the following credentials:\n\nUsername: ${data.email}\nPassword: ${data.password}\n\nThanks.\nRegards,\nScanNGet Support`,
      replyTo: config.outlookId
    };

    transporter.sendMail(mailOptions, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};
