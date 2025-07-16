const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: String,
  content: String,
  createdAt: { type: date, default: Date.Now },
  _user: { type: schema.Types.ObjectId, ref: 'user' }
});

mongoose.model('Blog', blogSchema);
