let config = require('@config');
let mongoose = require('mongoose');
let log = require('@common/log');

exports.connect = function () {
  mongoose.connect(config.mongoUrl, {
    reconnectInterval: 5000,
    reconnectTries: 60
  });
  let db = mongoose.connection;
  db.on(`error`, console.error.bind(console, `connection error:`));
  db.once(`open`, function () {
    // we`re connected!
    log(`MongoDB connected`);
    log(`###########################################################################`);
  });
};

