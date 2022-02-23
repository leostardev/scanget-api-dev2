const mongoose = require('mongoose');
const config = require('../../config')

mongoose.Promise = global.Promise;
const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }
  const options = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 3,
    reconnectInterval: 3000,
    keepAlive: true,
    connectTimeoutMS: 30000,
  };
  console.log('=> using new database connection');
  return mongoose.connect(config.mongoUrl, options).catch(err => {
    // console.log(err);
    throw (err);
  });
};

module.exports = connectToDatabase;
