const defaultCfg = require('./env/default');
const _ = require('lodash');
const env = process.env.NODE_ENV;
module.exports = env;
const config = defaultCfg;
const overrides = (env !== null && typeof env !== `undefined`) ? require(`./env/${env}`) : null;
if (env !== null && typeof env !== `undefined`) {
  _.merge(config, overrides);
}

module.exports = config;
