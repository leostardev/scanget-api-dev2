const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Sector';

const SectorSchema = new Schema({
  name: String,
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }
  ],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, SectorSchema);
