const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'Client';

const ClientSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  cognitoId: {
    type: String,
    index: true
  },
  clientAdmins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  vat: String,
  itc: String,
  name: String,
  address: String,
  postalCode: String,
  city: String,
  region: String,
  country: String,
  telephone: String,
  fax: String,
  website: String,
  email: String,
  logo: String,
  role: String,
  deactivated: {
    type: Boolean,
    default: false
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]

}, { timestamps: true });

ClientSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, ClientSchema);
