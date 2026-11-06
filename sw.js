// 오프라인에서도 열리도록 파일을 저장해 두는 서비스 워커.
// 사이트를 수정해서 배포할 때마다 VERSION 숫자를 올리면 설치된 앱도 새 버전으로 바뀝니다.
const VERSION = 'v1';
const CACHE = 'ow-stats-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 인터넷이 되면 최신 파일을 먼저 받고, 안 되면 저장해 둔 파일을 보여줍니다.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
