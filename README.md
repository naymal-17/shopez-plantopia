# ShopEZ (MERN) - Plantopia, toko tanaman hias

## Prasyarat
Node.js 18+ dan MongoDB (lokal atau MongoDB Atlas).

## Cara menjalankan
Terminal 1 (backend):
    cd server
    cp .env.example .env     # lalu isi MONGO_URI dan JWT_SECRET
    npm install
    npm start

Terminal 2 (frontend):
    cd client
    npm install
    npm start                # buka http://localhost:5173

## Isi data contoh (opsional)
    cd server
    npm run seed
Akun contoh (password 123456): penjual@shopez.com dan pembeli@shopez.com
