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

const dump = (label, c) => console.log(label, 'children=', c.childNodes.length, c.childNodes.map(n=>`[${n.nodeType}/${n.tagName||'#text'}:${JSON.stringify(n.textContent).slice(0,40)}]`));
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 5)); });

// Case 1: empty cart
store.removeItem('cabinet-closet-cart');
const c2 = win.document.createElement('div');
await act(async () => { createRoot(c2).render(createElement(FBT, {})); });
await tick();
dump('EMPTY-CART:', c2);
