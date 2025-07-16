const mongoose = require('mongoose');
const { Schema } = mongoose;

const sharedPostSchema = new Schema({
  _blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  _sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  _sharedWith: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedAt: { type: Date, default: Date.now },
  message: String // Optional message when sharing
});

// Ensure a post can only be shared once between two users
sharedPostSchema.index({ _blog: 1, _sharedBy: 1, _sharedWith: 1 }, { unique: true });

mongoose.model('SharedPost', sharedPostSchema);