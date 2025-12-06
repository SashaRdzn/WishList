const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Логин обязателен'],
    unique: true,
    trim: true,
    minlength: [3, 'Логин должен быть не менее 3 символов'],
    maxlength: [20, 'Логин должен быть не более 20 символов']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен быть не менее 6 символов']
  },
  publicId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function() {
  if (!this.publicId) {
    let publicId;
    let isUnique = false;
    while (!isUnique) {
      publicId = crypto.randomBytes(6).toString('hex');
      const existingUser = await mongoose.model('User').findOne({ publicId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    this.publicId = publicId;
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);