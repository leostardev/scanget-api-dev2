const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Retailer';

const RetailerSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  leaflets: [],
  shops: [
    {
      name: String,
      location: String,
      working_days: {
        monday: Boolean,
        tuesday: Boolean,
        wednesday: Boolean,
        thursday: Boolean,
        friday: Boolean,
        saturday: Boolean,
        sunday: Boolean,
      }
    }
  ],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, RetailerSchema);
