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
  },
  primewireCopy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }
});

export default mongoose.model('Media', mediaSchema);
