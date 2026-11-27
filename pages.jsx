import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Ctx } from './ctx.js';
import { api } from './api.js';
import Hero from './Hero.jsx';

const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const payLabel = { transfer: 'Transfer Bank', ewallet: 'E-Wallet', cod: 'Bayar di Tempat' };
const fail = (e) => alert(e.message);

export function Home() {
  const { user } = useContext(Ctx);
  const [list, setList] = useState([]);
  useEffect(() => { api('/products').then((d) => setList(d.slice(0, 4))).catch(() => {}); }, []);
  const levels = [
    ['mudah', 'Perawatan Mudah', 'Cocok untuk pemula, jarang disiram.'],
    ['sedang', 'Perawatan Sedang', 'Butuh perhatian rutin, hasilnya cantik.'],
    ['sulit', 'Perawatan Sulit', 'Untuk yang sudah berpengalaman.'],
  ];
  return (
    <div>
      <Hero />
      <section className="intro">
        <h1>Hijaukan rumahmu bersama Plantopia</h1>
        <p className="muted">Tanaman hias dan perlengkapan berkebun, dengan tingkat perawatan yang jelas.</p>
        <Link className="btn" to="/produk">Belanja sekarang</Link>
      </section>
      <h2>Pilih sesuai kemampuanmu</h2>
      <div className="grid three">
        {levels.map(([k, t, d]) => (
          <Link key={k} className="card level" to={'/produk?care=' + k}><h3>{t}</h3><p className="muted">{d}</p><b>Lihat tanaman →</b></Link>
        ))}
      </div>
      <h2>Produk terbaru</h2>
      <div className="grid">
        {list.map((p) => (
          <Link key={p._id} className="card level" to="/produk">
            <img src={p.image || 'https://placehold.co/300x200?text=Plantopia'} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=Plantopia'; }} />
            <h3>{p.name}</h3><b>{rp(p.price)}</b>
          </Link>
        ))}
      </div>
      <p className="center"><Link className="btn ghost" to="/produk">Lihat semua produk</Link></p>
      {!user && (
        <section className="cta">
          <h2>Mulai belanja</h2>
          <p className="muted">Buat akun untuk memesan, atau masuk kalau sudah punya.</p>
          <Link className="btn" to="/register">Daftar</Link> <Link className="btn ghost" to="/login">Masuk</Link>
        </section>
      )}
    </div>
  );
}

export function Login() {
  const { login } = useContext(Ctx);
  const go = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const submit = async () => { try { const d = await api('/login', 'POST', f); login(d.token, d.user); go('/'); } catch (e) { fail(e); } };
  return (
    <div className="box"><h2>Masuk</h2>
      <input placeholder="Email" onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button onClick={submit}>Masuk</button>
    </div>
  );
}

export function Register() {
  const go = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => { try { await api('/register', 'POST', f); alert('Registrasi berhasil, silakan masuk'); go('/login'); } catch (e) { fail(e); } };
  return (
    <div className="box"><h2>Daftar</h2>
      <input placeholder="Nama" onChange={set('name')} />
      <input placeholder="Email" onChange={set('email')} />
      <input type="password" placeholder="Password" onChange={set('password')} />
      <select onChange={set('role')}><option value="buyer">Pembeli</option><option value="seller">Penjual</option></select>
      <button onClick={submit}>Daftar</button>
    </div>
  );
}

export function Products() {
  const { add, user } = useContext(Ctx);
  const go = useNavigate();
  const [added, setAdded] = useState('');
  useEffect(() => { if (!added) return; const t = setTimeout(() => setAdded(''), 6000); return () => clearTimeout(t); }, [added]);
  // Tambah ke keranjang tetap di halaman ini (kalau belum login, ke halaman masuk)
  const buy = (p) => { if (!user) return go('/login'); add(p); setAdded(p.name); };
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [params] = useSearchParams();
  const [care, setCare] = useState(params.get('care') || '');
  const load = () => api('/products?q=' + encodeURIComponent(q) + '&care=' + care).then(setList).catch(fail);
  useEffect(() => { load(); }, [care]);
  return (
    <div>
      <div className="bar"><input placeholder="Cari produk..." value={q} onChange={(e) => setQ(e.target.value)} /><select value={care} onChange={(e) => setCare(e.target.value)}><option value="">Semua perawatan</option><option value="mudah">Mudah</option><option value="sedang">Sedang</option><option value="sulit">Sulit</option></select><button onClick={load}>Cari</button></div>
      {added && (
        <div className="toast" role="status">
          <span>✓ {added} masuk keranjang</span>
          <Link className="btn light" to="/cart">Lihat keranjang</Link>
          <button className="ghost" onClick={() => setAdded('')}>Lanjut belanja</button>
        </div>
      )}
      {!list.length && <p className="muted">Produk yang kamu cari tidak ditemukan. Coba kata kunci atau filter perawatan yang lain.</p>}
      <div className="grid">
        {list.map((p) => (
          <div className="card" key={p._id}>
            <img src={p.image || 'https://placehold.co/300x200?text=Plantopia'} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=Plantopia'; }} />
            <h3>{p.name}</h3>{p.care && <span className="tag">Perawatan {p.care}</span>}<p className="muted">{p.description}</p>
            <b>{rp(p.price)}</b><small>Stok: {p.stock}</small>
            {user?.role !== 'seller' && <button disabled={!p.stock} onClick={() => buy(p)}>Tambah ke keranjang</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Cart() {
  const { cart, remove, clear, setQty } = useContext(Ctx);
  const go = useNavigate();
  const [payment, setPayment] = useState('transfer');
  const [address, setAddress] = useState('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const methods = [
    ['transfer', 'Transfer Bank', 'Transfer ke rekening toko, lalu penjual mengonfirmasi pembayaranmu.'],
    ['ewallet', 'E-Wallet (GoPay, OVO, DANA)', 'Bayar lewat QR atau nomor e-wallet toko.'],
    ['cod', 'Bayar di Tempat (COD)', 'Bayar tunai saat pesanan sampai.'],
  ];
  const checkout = async () => {
    try {
      await api('/orders', 'POST', { items: cart.map((i) => ({ productId: i._id, qty: i.qty })), payment, address });
      clear(); go('/orders');
    } catch (e) { fail(e); }
  };
  if (!cart.length) return <p className="muted">Keranjang masih kosong. <Link to="/produk">Lihat produk</Link></p>;
  return (
    <div className="box wide"><h2>Keranjang</h2>
      {cart.map((i) => (
        <div className="row cart-row" key={i._id}><span>{i.name}</span>
          <span className="qty"><button className="ghost" onClick={() => setQty(i._id, i.qty - 1)} aria-label="Kurangi">−</button><span className="num">{i.qty}</span><button className="ghost" onClick={() => setQty(i._id, i.qty + 1)} aria-label="Tambah">+</button></span>
          <span className="sub">{rp(i.price * i.qty)}</span><button className="ghost" onClick={() => remove(i._id)}>Hapus</button></div>
      ))}
      <p><Link className="btn ghost" to="/produk">+ Tambah produk lain</Link></p>
      <h3>Alamat pengiriman</h3>
      <input placeholder="Alamat lengkap (jalan, kota, kode pos)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <h3>Metode pembayaran</h3>
      {methods.map(([k, t, d]) => (
        <label key={k} className={'pay' + (payment === k ? ' on' : '')}>
          <input type="radio" name="pay" checked={payment === k} onChange={() => setPayment(k)} />
          <span><b>{t}</b><br /><small className="muted">{d}</small></span>
        </label>
      ))}
      <h3>Total: {rp(total)}</h3>
      <button onClick={checkout}>Bayar dan pesan</button>
    </div>
  );
}

export function Orders() {
  const { user } = useContext(Ctx);
  const [list, setList] = useState([]);
  const load = () => api('/orders').then(setList).catch(fail);
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { try { await api('/orders/' + id, 'PUT', { status }); load(); } catch (e) { fail(e); } };
  if (!list.length) return <p className="muted">Belum ada pesanan.</p>;
  return (
    <div className="box wide"><h2>Pesanan</h2>
      {list.map((o) => (
        <div className="order" key={o._id}>
          <div className="row"><b>#{o._id.slice(-6)}</b><span>{new Date(o.createdAt).toLocaleDateString('id-ID')}</span>
            {user.role === 'seller'
              ? <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}><option>menunggu</option><option>dibayar</option><option>dikirim</option></select>
              : <span className="tag">{o.status}</span>}
          </div>
          {o.items.map((i, k) => <div className="muted" key={k}>{i.name} × {i.qty} — {rp(i.price * i.qty)}</div>)}
          <div className="muted">Pembayaran: {payLabel[o.payment] || '-'} · Dikirim ke: {o.address || '-'}</div>
          <b>Total: {rp(o.total)}</b>
        </div>
      ))}
    </div>
  );
}

export function Seller() {
  const empty = { name: '', description: '', price: '', image: '', stock: '', care: '' };
  const [f, setF] = useState(empty);
  const [list, setList] = useState([]);
  const load = () => api('/my-products').then(setList).catch(fail);
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => { try { await api('/products', 'POST', { ...f, price: +f.price, stock: +f.stock }); setF(empty); load(); } catch (e) { fail(e); } };
  const del = async (id) => { if (confirm('Hapus produk ini?')) { await api('/products/' + id, 'DELETE').catch(fail); load(); } };
  const edit = async (p) => {
    const price = prompt('Harga baru:', p.price); const stock = prompt('Stok baru:', p.stock);
    if (price === null || stock === null) return;
    await api('/products/' + p._id, 'PUT', { ...p, price: +price, stock: +stock }).catch(fail); load();
  };
  return (
    <div className="box wide"><h2>Kelola Produk</h2>
      <label className="lbl">Nama produk</label>
      <input placeholder="Contoh: Melati" value={f.name} onChange={set('name')} />
      <label className="lbl">Deskripsi</label>
      <input placeholder="Contoh: Tanaman melati putih harum" value={f.description} onChange={set('description')} />
      <label className="lbl">Harga (Rp, tulis angka saja tanpa titik, misal 20000)</label>
      <input placeholder="20000" type="number" value={f.price} onChange={set('price')} />
      <label className="lbl">Stok</label>
      <input placeholder="100" type="number" value={f.stock} onChange={set('stock')} />
      <label className="lbl">Tingkat perawatan</label>
      <select value={f.care} onChange={set('care')}><option value="">Bukan tanaman</option><option value="mudah">Perawatan mudah</option><option value="sedang">Perawatan sedang</option><option value="sulit">Perawatan sulit</option></select>
      <label className="lbl">Gambar produk (opsional): isi alamat gambar, contoh /produk/melati.jpg</label>
      <input placeholder="/produk/melati.jpg" value={f.image} onChange={set('image')} />
      <button onClick={save}>Tambah produk</button>
      {list.map((p) => (
        <div className="row" key={p._id}><span>{p.name}</span><span>{rp(p.price)} · stok {p.stock}</span>
          <span><button className="ghost" onClick={() => edit(p)}>Ubah</button> <button className="ghost" onClick={() => del(p._id)}>Hapus</button></span></div>
      ))}
    </div>
  );
}
