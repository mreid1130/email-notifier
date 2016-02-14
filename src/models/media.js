import mongoose from 'mongoose';

const mediaSchema = mongoose.Schema({
  title: String,
  shortname: String,
  found: {
    type: Boolean,
    default: false
  },
  foundAt: Date,
  url: String,
  created: {
    type: Date,
    default: new Date()
  },
  userCreated: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Media', mediaSchema);
