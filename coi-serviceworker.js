// Gives games that need "cross-origin isolation" the headers GitHub Pages can't send.
// Only the home page and files under resources/ are touched. The /anime page is left alone,
// so its posters and data from other websites keep loading.
if (typeof window === 'undefined') {
  // ---- the service worker ----
  self.addEventListener('install', function () { self.skipWaiting(); });
  self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
  self.addEventListener('fetch', function (e) {
    var r = e.request, u = new URL(r.url);
    if (u.origin !== self.location.origin) return;
    var base = new URL(self.registration.scope).pathname;   // "/" on your domain
    var home = u.pathname === base || u.pathname === base + 'index.html';
    if (!(home || u.pathname.indexOf(base + 'resources/') === 0)) return;
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;
    e.respondWith(fetch(r).then(function (res) {
      if (res.status === 0) return res;   // redirects pass through untouched
      var h = new Headers(res.headers);
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      h.set('Cross-Origin-Embedder-Policy', 'require-corp');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }));
  });
} else {
  // ---- the part that runs in the page: register once, reload once ----
  (function () {
    var n = navigator, KEY = 'coi-tried';
    if (window.crossOriginIsolated) { try { sessionStorage.removeItem(KEY); } catch (e) {} return; }
    if (!n.serviceWorker || !window.isSecureContext) return;
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
    var go = function () { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} location.reload(); };
    n.serviceWorker.register(document.currentScript.src).then(function (reg) {
      if (n.serviceWorker.controller || reg.active) go();
      else n.serviceWorker.addEventListener('controllerchange', go);
    });
  })();
}
