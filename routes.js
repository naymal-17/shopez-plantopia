import 'express-async-errors';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Product, Order } from './models.js';

const r = Router();

// Satpam: cek token login. Kalau diisi role, cek juga perannya (buyer/seller)
const auth = (role) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (role && req.user.role !== role) return res.status(403).json({ message: 'Akses ditolak' });
    next();
  } catch {
    res.status(401).json({ message: 'Silakan login dulu' });
  }
};

// ---- AUTH ----
r.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Semua kolom wajib diisi' });
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email sudah terdaftar' });
  await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role === 'seller' ? 'seller' : 'buyer' });
  res.status(201).json({ message: 'Registrasi berhasil' });
});

r.post('/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password)))
    return res.status(400).json({ message: 'Email atau password salah' });
  const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: u.name, role: u.role } });
});

// ---- PRODUK ----
r.get('/products', async (req, res) => {
  const q = String(req.query.q || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = {};
  if (q) filter.name = new RegExp(q, 'i');
  if (['mudah', 'sedang', 'sulit'].includes(req.query.care)) filter.care = req.query.care;
  res.json(await Product.find(filter).sort('-createdAt'));
});
r.get('/my-products', auth('seller'), async (req, res) => res.json(await Product.find({ seller: req.user.id }).sort('-createdAt')));
r.post('/products', auth('seller'), async (req, res) => {
  const { name, description, price, image, stock, care } = req.body;
  res.status(201).json(await Product.create({ name, description, price, image, stock, care, seller: req.user.id }));
});
r.put('/products/:id', auth('seller'), async (req, res) => {
  const { name, description, price, image, stock, care } = req.body;
  res.json(await Product.findOneAndUpdate({ _id: req.params.id, seller: req.user.id }, { name, description, price, image, stock, care }, { new: true }));
});
r.delete('/products/:id', auth('seller'), async (req, res) => {
  await Product.deleteOne({ _id: req.params.id, seller: req.user.id });
  res.json({ message: 'Produk dihapus' });
});

// ---- PESANAN ----
r.post('/orders', auth(), async (req, res) => {
  const { payment, address } = req.body;
  if (!address || !['transfer', 'ewallet', 'cod'].includes(payment))
    return res.status(400).json({ message: 'Alamat dan metode pembayaran wajib diisi' });
  const items = [];
  let total = 0;
  for (const i of req.body.items || []) {
    const p = await Product.findById(i.productId);
    if (!p || p.stock < i.qty) return res.status(400).json({ message: `Stok ${p ? p.name : 'produk'} tidak cukup` });
    p.stock -= i.qty;
    await p.save();
    items.push({ product: p._id, seller: p.seller, name: p.name, price: p.price, qty: i.qty });
    total += p.price * i.qty;
  }
  if (!items.length) return res.status(400).json({ message: 'Keranjang kosong' });
  res.status(201).json(await Order.create({ buyer: req.user.id, items, total, payment, address }));
});
r.get('/orders', auth(), async (req, res) => {
  const filter = req.user.role === 'seller' ? { 'items.seller': req.user.id } : { buyer: req.user.id };
  res.json(await Order.find(filter).sort('-createdAt'));
});
r.put('/orders/:id', auth('seller'), async (req, res) => {
  res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }));
});

export default r;