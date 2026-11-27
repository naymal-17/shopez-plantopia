const BASE = 'http://localhost:5000/api';

// Satu fungsi buat semua request ke backend. Token login otomatis ikut terkirim.
export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}
