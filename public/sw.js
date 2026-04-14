importScripts("/push-sw.js");
var CACHE_NAME = "rtr-cache-v1";
self.addEventListener("install", function() { console.log("[SW] Installing"); self.skipWaiting(); });
self.addEventListener("activate", function(event) { console.log("[SW] Activating"); event.waitUntil(caches.keys().then(function(names) { return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); })); }).then(function() { return self.clients.claim(); })); });
self.addEventListener("fetch", function(event) { if (event.request.method !== "GET") return; var url = new URL(event.request.url); if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) return; });
console.log("[SW] Service worker loaded");
