import mongoose from 'mongoose';

const mediaSchema = mongoose.Schema({
  title: String,
  shortname: {
    type: String,
    unique: true
  },
  found: {
    type: Boolean,
    default: false
  },
  foundAt: Date,
  url: String,
  created: {
    type: Date,
    default: new Date()
  }
});

export default mongoose.model('Media', mediaSchema);
