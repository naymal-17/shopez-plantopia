import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Ganti slide otomatis tiap berapa milidetik (3000 = 3 detik, 5000 = 5 detik)
const INTERVAL = 5000;

// Semua foto di folder src/banner otomatis jadi slide banner.
// Tinggal taruh fotonya (jpg/png/webp) di folder itu, urutannya sesuai nama file (1.jpg, 2.jpg, ...).
const files = import.meta.glob('./banner/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
const photos = Object.keys(files).sort().map((k) => ({ image: files[k] }));

// Kalau folder banner masih kosong, dipakai slide warna ini
const fallback = [
  { title: 'Hijaukan Rumahmu', text: 'Tanaman hias pilihan, mulai Rp 35.000', bg: 'linear-gradient(120deg,#0F766E,#14B8A6)' },
  { title: 'Pemula? Mulai dari yang Mudah', text: 'Pakai filter perawatan "Mudah" untuk tanaman anti ribet', bg: 'linear-gradient(120deg,#365314,#84CC16)' },
  { title: 'Lengkapi Perlengkapan Berkebun', text: 'Pot, pupuk, dan media tanam siap pakai', bg: 'linear-gradient(120deg,#134E4A,#5EEAD4)' },
];
const slides = photos.length ? photos : fallback;

export default function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  const go = (d) => setI((n) => (n + d + slides.length) % slides.length);

  return (
    <section className="hero" aria-label="Banner promo">
      {slides.map((s, k) => (
        <div
          key={k}
          className={'slide' + (k === i ? ' on' : '') + (s.title ? ' text' : '')}
          style={{ background: s.image ? `url(${s.image}) center/cover` : s.bg }}
        >
          {s.title && <h2>{s.title}</h2>}
          {s.text && <p>{s.text}</p>}
          {s.title && <Link className="btn light" to="/produk">Belanja sekarang</Link>}
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button className="nav-btn prev" onClick={() => go(-1)} aria-label="Sebelumnya">‹</button>
          <button className="nav-btn next" onClick={() => go(1)} aria-label="Berikutnya">›</button>
          <div className="dots">
            {slides.map((_, k) => (
              <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={'Slide ' + (k + 1)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
