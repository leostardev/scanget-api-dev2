const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Family';

const FamilySchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  name: String,
  familyAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  familyMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  familyCode: String,
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }
  ],
  active: {
    type: Boolean,
    default: true
  },
  accountDetails: {
    account_title: {
      type: String,
      default: ''
    },
    bank_name: {
      type: String,
      default: ''
    },
    iban_no: {
      type: String,
      default: ''
    },
    swift_code: {
      type: String,
      default: ''
    },
    is_donating: {
      type: Boolean,
      default: false
    },
    donation: {
      type: Schema.Types.ObjectId,
      ref: 'Donation'
    }
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, FamilySchema);
