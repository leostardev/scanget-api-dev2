const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'CommunityRecipe';

const CommunityRecipeSchema = new Schema({
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  title: String,
  images: [],
  description: String,
  active: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  ingredients: [],
  weight: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunityRecipeSchema);
