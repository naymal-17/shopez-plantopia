import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Product } from './models.js';

await mongoose.connect(process.env.MONGO_URI);

// Hapus data contoh lama (kalau ada), supaya bisa dijalankan berkali-kali
const old = await User.findOne({ email: 'penjual@shopez.com' });
if (old) await Product.deleteMany({ seller: old._id });
await User.deleteMany({ email: { $in: ['penjual@shopez.com', 'pembeli@shopez.com'] } });

const pass = await bcrypt.hash('123456', 10);
const seller = await User.create({ name: 'Toko Plantopia', email: 'penjual@shopez.com', password: pass, role: 'seller' });
await User.create({ name: 'Amel', email: 'pembeli@shopez.com', password: pass, role: 'buyer' });

// Nama file foto di folder client/public/produk/
const foto = {
  'Monstera Deliciosa': 'monstera.jpg',
  'Kaktus Mini Set (3 pcs)': 'kaktus.jpg',
  'Lidah Mertua': 'lidah-mertua.jpg',
  'Anggrek Bulan': 'anggrek.jpg',
  'Calathea Orbifolia': 'calathea.jpg',
  'Fiddle Leaf Fig': 'fiddle-leaf.jpg',
  'Pot Keramik Putih 15cm': 'pot.jpg',
  'Pupuk Organik Cair 250ml': 'pupuk.jpg',
  'Sekop Mini Set Berkebun': 'sekop.jpg',
  'Media Tanam 5L': 'media-tanam.jpg',
};
const data = [
  ['Monstera Deliciosa', 'Daun besar berlubang, cocok untuk ruang tamu.', 85000, 20, 'mudah'],
  ['Kaktus Mini Set (3 pcs)', 'Kaktus kecil untuk meja kerja, jarang disiram.', 35000, 40, 'mudah'],
  ['Lidah Mertua', 'Tahan di ruangan minim cahaya dan membantu menyegarkan udara.', 45000, 30, 'mudah'],
  ['Anggrek Bulan', 'Bunga tahan lama, perlu sinar tidak langsung.', 150000, 12, 'sedang'],
  ['Calathea Orbifolia', 'Daun bergaris cantik, butuh kelembapan terjaga.', 120000, 10, 'sulit'],
  ['Fiddle Leaf Fig', 'Pohon indoor populer, sensitif kalau sering dipindah.', 220000, 8, 'sulit'],
  ['Pot Keramik Putih 15cm', 'Pot dengan lubang drainase dan tatakan.', 40000, 50, ''],
  ['Pupuk Organik Cair 250ml', 'Untuk tanaman daun, dipakai dua minggu sekali.', 30000, 60, ''],
  ['Sekop Mini Set Berkebun', 'Sekop, garpu, dan penggaruk ukuran mini.', 55000, 35, ''],
  ['Media Tanam 5L', 'Campuran tanah, sekam, dan kompos siap pakai.', 25000, 45, ''],
];
await Product.insertMany(data.map(([name, description, price, stock, care]) => ({ name, description, price, stock, care, image: '/produk/' + foto[name], seller: seller._id })));

console.log('Selesai! Akun contoh: penjual@shopez.com / pembeli@shopez.com (password: 123456)');
await mongoose.disconnect();