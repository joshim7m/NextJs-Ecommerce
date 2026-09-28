import { register } from 'node:module';
register('/home/joshim/NextApp/radiant-picks/.tmptest/jsxhook.mjs', import.meta.url);
await import('/home/joshim/NextApp/radiant-picks/.tmptest/dom.mjs');
import { createRoot } from 'react-dom/client';
import { act, createElement } from 'react';
import { win } from '/home/joshim/NextApp/radiant-picks/.tmptest/dom.mjs';

const ADD_ONS = [
  { id:'a', slug:'bra',  sku:'S1', title:'Bra',  unite_price:800,  sale_price:null, quantity:5, images:[{image_path:'/a.jpg'}], variants:[] },
  { id:'b', slug:'pant', sku:'S2', title:'Pant', unite_price:650,  sale_price:null, quantity:2, images:[{image_path:'/b.jpg'}], variants:[] },
  { id:'c', slug:'set',  sku:'S3', title:'Set',  unite_price:2000, sale_price:null, quantity:1, images:[], variants:[] },
];
globalThis.fetch = async () => ({ ok: true, json: async () => ({ products: ADD_ONS }) });
const store = win.localStorage;
const mod = await import('/home/joshim/NextApp/radiant-picks/.tmptest/src/components/storefront/FrequentlyBoughtTogether.jsx');
const FBT = mod.default;
const rprops = (n) => { const k = Object.getOwnPropertyNames(n).find(x => x.startsWith('__reactProps$')); return k ? n[k] : null; };
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 5)); });

const container = win.document.createElement('div');
globalThis.__r = createRoot(container);
store.setItem('cabinet-closet-cart', JSON.stringify([{productId:'a',productSlug:'bra',sku:'S1',title:'Bra',price:800,salePrice:800,quantity:1,variantId:''}]));
await act(async () => { globalThis.__r.render(createElement(FBT, {})); });
await tick();
const btn = (() => { let o=null; const w=(n)=>{ if(n.tagName==='BUTTON'&&n.textContent.includes('Add all to cart')) o=n; (n.childNodes||[]).forEach(w); }; container.childNodes.forEach(w); return o; })();
console.log('button found:', !!btn, 'props keys:', btn && Object.keys(rprops(btn)));
await act(async () => { rprops(btn).onClick(); });
await tick();
console.log('cart:', JSON.stringify(JSON.parse(store.getItem('cabinet-closet-cart'))));
console.log('CTA text:', JSON.stringify(container.textContent.match(/Add all to cart|Add bundle to cart|Added to cart/g)));
console.log('tail:', JSON.stringify(container.textContent.slice(-160)));
