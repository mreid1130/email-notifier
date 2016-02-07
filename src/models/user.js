import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

var userSchema = mongoose.Schema({
  localAuth: {
    email: {
      type: String,
      unique: true
    }
    // password: String
  },
  created: {
    type: Date,
    default: new Date()
  }
});

// // methods ======================
// userSchema.methods.generateHash = function(password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// userSchema.methods.validPassword = function(password) {
//   return bcrypt.compareSync(password, this.localAuth.password);
// };

export default mongoose.model('User', userSchema);
