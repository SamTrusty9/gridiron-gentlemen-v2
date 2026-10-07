/* Gridiron Gentlemen's Society — service worker.
   Cache-first for the app shell (/, index.html, css/, js/, assets/).
   Network-first for data/*.json (with cache fallback).
   Relative URLs so the site works under a GitHub Pages subpath. */
var CACHE = 'ggs-shell-v3';

var SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/lib.js',
  'js/app.js',
  'assets/art/league-emblem.webp',
  'assets/apple-touch-icon.png',
  'assets/icon-192.png',
  'assets/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isDataRequest(url) {
  return url.pathname.indexOf('/data/') !== -1;
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (isDataRequest(url)) {
    /* Network-first: fresh stats when online, cached copy when offline. */
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || new Response('{"error":"offline"}', {
            status: 503, headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  /* Cache-first for the app shell; populate cache on the fly (covers section files). */
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      });
    })
  );
});
