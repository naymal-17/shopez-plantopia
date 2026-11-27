import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Penangkap error: kalau ada yang error, kirim pesan rapi (bukan server mati)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan di server' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB terhubung');
    app.listen(process.env.PORT || 5000, () => console.log('Server jalan di port ' + (process.env.PORT || 5000)));
  })
  .catch((e) => console.error('Gagal konek MongoDB:', e.message));
