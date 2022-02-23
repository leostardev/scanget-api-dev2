'use strict';

const v4 = require('./sign.aws');
const crypto = require('crypto');
const configs = require('../config');

exports.getMqttUrl = () => {
  let url = v4.createPresignedURL(
    'GET',
    configs.IOTPublishEndpoint,
    '/mqtt',
    'iotdevicegateway',
    crypto.createHash('sha256').update('', 'utf8').digest('hex'),
    {
      'expires': 7200,
      'key': process.env.IOT_USER_ID,
      'secret': process.env.IOT_USER_SECRET,
      'protocol': 'wss',
      'region': configs.aws.region,
      'signSessionToken': false
    }
  );
  // splitting url to remove X-Amz-Secuirty-Token so mqtt broker can connect
  url = url.split('&X-Amz-Security-Token')[0];

  return url;
};
