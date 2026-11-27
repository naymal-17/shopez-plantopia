import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Ctx } from './ctx.js';
import { Home, Login, Register, Products, Cart, Orders, Seller } from './pages.jsx';

const read = (k, d) => JSON.parse(localStorage.getItem(k) || d);

export default function App() {
  const [user, setUser] = useState(() => read('user', 'null'));
  const [cart, setCart] = useState(() => read('cart', '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setCart([]); };
  const add = (p) => setCart((c) => c.find((i) => i._id === p._id)
    ? c.map((i) => (i._id === p._id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i))
    : [...c, { ...p, qty: 1 }]);
  const remove = (id) => setCart((c) => c.filter((i) => i._id !== id));
  const clear = () => setCart([]);
  const setQty = (id, q) => setCart((c) => c.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(q, i.stock)) } : i)));

  const need = (el, role) => (!user ? <Navigate to="/login" /> : role && user.role !== role ? <Navigate to="/" /> : el);

  return (
    <Ctx.Provider value={{ user, cart, login, logout, add, remove, clear, setQty }}>
      <header className="nav">
        <Link to="/" className="logo">Plantopia</Link>
        <nav>
          <Link to="/">Beranda</Link>
          <Link to="/produk">Produk</Link>
          {user?.role === 'buyer' && (
            <Link to="/cart" className="cart-link" aria-label="Keranjang belanja" title="Keranjang">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
              {cart.length > 0 && <span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>}
            </Link>
          )}
          {user && <Link to="/orders">Pesanan</Link>}
          {user?.role === 'seller' && <Link to="/seller">Kelola Produk</Link>}
          {user ? <button onClick={logout}>Keluar ({user.name})</button> : <><Link to="/login">Masuk</Link><Link to="/register">Daftar</Link></>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={need(<Cart />, 'buyer')} />
          <Route path="/orders" element={need(<Orders />)} />
          <Route path="/seller" element={need(<Seller />, 'seller')} />
        </Routes>
      </main>
    </Ctx.Provider>
  );
}
