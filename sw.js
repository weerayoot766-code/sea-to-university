// ให้แอปเปิดได้แม้ออฟไลน์ เปลี่ยนเลขเวอร์ชันทุกครั้งที่อัปเดตไฟล์
const CACHE = 'sea2uni-v5';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
// ลบเฉพาะแคชเก่าของแอปนี้ (ขึ้นต้นด้วย sea2uni-) ไม่ยุ่งกับแคชของแอปอื่นในโดเมนเดียวกัน
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sea2uni-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    // หน้าแอป: ลองโหลดเวอร์ชันล่าสุดก่อน ถ้าออฟไลน์ใช้ตัวที่เก็บไว้
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // ไฟล์อื่นและฟอนต์: ใช้ของในแคชก่อน แล้วเก็บของใหม่ไว้
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  })));
});
