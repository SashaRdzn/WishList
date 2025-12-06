const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название подарка обязательно'],
    trim: true,
    maxlength: [100, 'Название не должно превышать 100 символов']
  },
  image: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    default: null,
    min: [0, 'Цена не может быть отрицательной']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reserved: {
    type: Boolean,
    default: false
  },
  reservedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Wish', wishSchema);

