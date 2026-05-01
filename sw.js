/* Service Worker — Painel Financeiro Familiar
   Garante funcionamento 100% offline após primeira visita */

var CACHE = 'financeiro-v1';
var ASSETS = [
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

/* Remove caches antigos ao ativar nova versão */
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

/* Serve do cache primeiro; fallback para rede se não encontrar */
self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        /* Cacheia dinamicamente recursos novos */
        if(res && res.status === 200 && e.request.method === 'GET'){
          var resClone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, resClone); });
        }
        return res;
      });
    }).catch(function(){
      /* Se estiver completamente offline e não tiver cache, retorna o index */
      return caches.match('./index.html');
    })
  );
});
