import mongoose from 'mongoose';

const subscriptionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  mediaFound: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  updating: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: new Date()
  }
});

subscriptionSchema.index({
  user: 1
});

subscriptionSchema.index({
  complete: 1
});

subscriptionSchema.index({
  updating: 1
});

subscriptionSchema.index({
  complete: 1,
  updating: 1
});

subscriptionSchema.index({
  media: 1,
  complete: 1
});

export default mongoose.model('Subscription', subscriptionSchema);
