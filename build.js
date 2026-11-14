// Baut aus web/app.html die installierbare, offline-fähige App im Ordner docs/
// (docs/ kann direkt per GitHub Pages veröffentlicht werden).
// Aufruf: node build.js
const fs = require("fs"), path = require("path");
const dir = __dirname, out = path.join(dir, "docs");
fs.mkdirSync(out, { recursive: true });
const app = fs.readFileSync(path.join(dir, "web/app.html"), "utf8");
const version = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font-size:14px}[hidden]{display:none!important}</style>
</head><body>
${app}
<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});</script>
</body></html>
`;
fs.writeFileSync(path.join(out, "index.html"), html);

fs.writeFileSync(path.join(out, "manifest.webmanifest"), JSON.stringify({
  name: "Lotte Windanzeige",
  short_name: "Lotte Wind",
  lang: "de",
  start_url: "./",
  scope: "./",
  display: "fullscreen",
  orientation: "any",
  background_color: "#0d1b26",
  theme_color: "#0d1b26",
  icons: [
    { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
}, null, 2));

fs.writeFileSync(path.join(out, "sw.js"), `// Offline-Cache: Die App funktioniert an Bord ohne Internet.
const CACHE = "lotte-wind-${version}";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Erst Netz (für Updates), sonst Cache
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
`);
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("docs/ gebaut, Version", version, "index.html", html.length, "Bytes");
