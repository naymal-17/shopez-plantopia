import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });

export const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
}));

export const Product = model('Product', new Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  stock: { type: Number, default: 0 },
  care: { type: String, enum: ['', 'mudah', 'sedang', 'sulit'], default: '' },
  seller: ref('User'),
}, { timestamps: true }));

export const Order = model('Order', new Schema({
  buyer: ref('User'),
  items: [{ product: ref('Product'), seller: ref('User'), name: String, price: Number, qty: Number }],
  total: Number,
  payment: String,
  address: String,
  status: { type: String, enum: ['menunggu', 'dibayar', 'dikirim'], default: 'menunggu' },
}, { timestamps: true }));