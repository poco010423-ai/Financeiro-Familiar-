/* Service Worker — Financeiro Familiar
   Versão: vaf-v26
   IMPORTANTE: incrementar CACHE a cada deploy para forçar atualização nos clientes */

var CACHE = 'vaf-v26';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

/* Instala e pré-cacheia todos os arquivos do app */
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

/* Remove caches antigos (versões anteriores) ao ativar */
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Estratégia: cache primeiro, fallback para rede */
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = e.request.url;
  if(url.indexOf('chrome-extension') === 0) return;
  if(url.indexOf('content://') === 0) return;

  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(resp){
        if(!resp || resp.status !== 200) return resp;
        var clone = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return resp;
      }).catch(function(){
        /* Offline total: retorna index.html para navegação */
        return caches.match('./index.html');
      });
    })
  );
});
