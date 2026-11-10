'use strict';

const base=self.registration.scope;
const prefix='freya-local-pwa:'+base+':';
const version=prefix+'871958B56BF3';
const files=['index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const assets=new Set(files.map(file=>new URL(file,base).href));
const index=new URL('index.html',base).href;

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(version).then(cache=>cache.addAll([...assets])));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==version)await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const {request}=event;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  url.search='';
  url.hash='';
  if(request.mode==='navigate' && (url.href===base || url.href===index)){
    event.respondWith((async()=>{
      try{return await fetch(request);}
      catch{return await (await caches.open(version)).match(index) || Response.error();}
    })());
  }else if(assets.has(request.url)){
    event.respondWith(caches.open(version).then(async cache=>(await cache.match(request))||fetch(request)));
  }
});
