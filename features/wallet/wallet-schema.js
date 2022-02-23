const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Wallet';

const WalletSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ],
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User'
  // },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    index: true
  },
  balance: {
    type: Number,
    default: 0
  },
  savedAmount: {
    type: Number,
    default: 0
  },
  amountSpent: {
    type: Number,
    default: 0
  },
  totalCommunityPoints: {
    type: Number,
    default: 0
  },
  remainingCommunityPoints: {
    type: Number,
    default: 0
  },
  redeemedCommunityPoints: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, WalletSchema);
