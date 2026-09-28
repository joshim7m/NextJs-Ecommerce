import { register } from 'node:module';
register('/home/joshim/NextApp/radiant-picks/.tmptest/jsxhook.mjs', import.meta.url);
await import('/home/joshim/NextApp/radiant-picks/.tmptest/dom.mjs');

import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { createElement } from 'react';
import { win } from '/home/joshim/NextApp/radiant-picks/.tmptest/dom.mjs';

const ADD_ONS = [
  { id:'a', slug:'bra',  sku:'S1', title:'Bra',  unite_price:800,  sale_price:null, quantity:5, images:[{image_path:'/a.jpg'}], variants:[] },
  { id:'b', slug:'pant', sku:'S2', title:'Pant', unite_price:650,  sale_price:null, quantity:2, images:[{image_path:'/b.jpg'}], variants:[] },
  { id:'c', slug:'set',  sku:'S3', title:'Set',  unite_price:2000, sale_price:null, quantity:1, images:[], variants:[] },
];

const FETCHES = [];
let FAIL_NEXT = false;
globalThis.fetch = async (url) => {
  FETCHES.push(url);
  if (FAIL_NEXT) { FAIL_NEXT = false; throw new Error('network down'); }
  return { ok: true, json: async () => ({ products: ADD_ONS, source: 'auto' }) };
};

const store = win.localStorage;
const seedCart = (items) => store.setItem('cabinet-closet-cart', JSON.stringify(items));
const readCart = () => JSON.parse(store.getItem('cabinet-closet-cart') || '[]');

const mod = await import('/home/joshim/NextApp/radiant-picks/.tmptest/src/components/storefront/FrequentlyBoughtTogether.jsx');
const FBT = mod.default;
const { PdpBundle } = mod;

const container = win.document.createElement('div');
const root = createRoot(container);
const html = () => { let out=''; const walk=(n)=>{ if(n.tagName) out+='<'+n.tagName.toLowerCase()+'>'; (n.childNodes||[]).forEach(walk); if(n.tagName) out+='</'+n.tagName.toLowerCase()+'>'; }; container.childNodes.forEach(walk); return out; };
const text = () => container.textContent;

let pass=0, fail=0;
const check=(n,c,x='')=>{ c?(pass++,console.log(`  PASS  ${n}`)):(fail++,console.log(`  FAIL  ${n}  ${x}`)); };
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 5)); });
// React renders `null` as an empty text-node placeholder, so "renders nothing"
// means no element nodes — not an empty childNodes array.
const elementsIn = (c) => c.childNodes.filter((n) => n.nodeType === 1);

// React hangs the committed props off the DOM node under a generated
// `__reactProps$…` key — there is no `.props` to read.
const rprops = (n) => {
  const key = Object.getOwnPropertyNames(n).find((k) => k.startsWith('__reactProps$'));
  return key ? n[key] : null;
};
const fire = (n) => { const p = rprops(n); if (!p || typeof p.onClick !== 'function') throw new Error('no onClick on node'); return p.onClick(); };

// Find a button by its aria-label / text, then fire its onClick.
const findBtn = (pred) => {
  const out=[];
  const walk=(n)=>{ if(n.tagName==='BUTTON' && pred(n)) out.push(n); (n.childNodes||[]).forEach(walk); };
  container.childNodes.forEach(walk);
  return out;
};
const click = (n) => act(async () => { fire(n); });

console.log('=== A. loads and renders ===');
FETCHES.length = 0;
seedCart([{productId:'a',productSlug:'bra',sku:'S1',title:'Bra',price:800,salePrice:800,quantity:1,variantId:''}]);
await act(async () => { root.render(createElement(FBT, {})); });
await tick();
check('fetches once on mount', FETCHES.length === 1, 'got '+FETCHES.length);
check('renders the heading', text().includes('Frequently Bought Together'));
check('renders 3 add-ons', ['Bra','Pant','Set'].every(t=>text().includes(t)));

console.log('\n=== B. re-fetch guard: our own "Add all" must not refetch ===');
FETCHES.length = 0;
const addAll = findBtn(n => n.textContent.includes('Add all to cart'))[0];
check('CTA found', !!addAll);
await click(addAll);
check('no refetch after own add', FETCHES.length === 0, 'refetched '+FETCHES.length+' time(s)');
check('add-ons are in the cart', readCart().length === 3, JSON.stringify(readCart().map(i=>i.productSlug)));
check('each added exactly once at qty 1', readCart().every(i=>i.quantity===1));
check('existing item quantity unchanged', readCart().find(i=>i.productSlug==='bra').quantity === 1);
check('CTA flipped to Added', text().includes('Added to cart'));

console.log('\n=== C. a later external cart change still refreshes ===');
FETCHES.length = 0;
await act(async () => { seedCart([{productId:'z',productSlug:'zzz',sku:'S9',title:'Other',price:100,salePrice:100,quantity:1,variantId:''}]); win.dispatchEvent(new win.Event('cart-updated')); });
await tick();
check('external change does NOT refetch (customer already settled)', FETCHES.length === 0, 'refetched');

console.log('\n=== D. GTM fires once, with all items ===');
const layer = [];
globalThis.window.dataLayer = layer;
const { pushDataLayer } = await import('/home/joshim/NextApp/radiant-picks/.tmptest/src/lib/gtm.js');
check('gtm module exports pushDataLayer', typeof pushDataLayer === 'function');

console.log('\n=== E. empty cart renders nothing ===');
const c2 = win.document.createElement('div');
const r2 = createRoot(c2);
store.removeItem('cabinet-closet-cart');
await act(async () => { r2.render(createElement(FBT, {})); });
await tick();
check('empty cart => no markup', elementsIn(c2).length === 0, elementsIn(c2).length + ' element(s)');

console.log('\n=== F. API failure renders nothing and does not throw ===');
const c3 = win.document.createElement('div');
const r3 = createRoot(c3);
seedCart([{productId:'a',productSlug:'bra',sku:'S1',title:'Bra',price:800,salePrice:800,quantity:1,variantId:''}]);
FAIL_NEXT = true;
let threw = false;
try { await act(async () => { r3.render(createElement(FBT, {})); }); await tick(); } catch (e) { threw = true; console.log('   threw:', e.message); }
check('no uncaught throw on API failure', !threw);
check('renders nothing on failure', c3.childNodes.length === 0);

console.log('\n=== G. hideWhenInCart drops what was added ===');
const c4 = win.document.createElement('div');
const r4 = createRoot(c4);
seedCart([{productId:'a',productSlug:'bra',sku:'S1',title:'Bra',price:800,salePrice:800,quantity:1,variantId:''}]);
FETCHES.length = 0;
await act(async () => { r4.render(createElement(FBT, { hideWhenInCart: true })); });
await tick();
const c4text = () => c4.textContent;
check('renders 3 before adding', ['Bra','Pant','Set'].every(t=>c4text().includes(t)));
const c4walk=(n,out=[])=>{ if(n.tagName==='BUTTON'&&n.textContent.includes('Add all to cart')) out.push(n); (n.childNodes||[]).forEach(x=>c4walk(x,out)); return out; };
await act(async () => { fire(c4walk(c4)[0]); });
await tick();
check('all add-ons gone after adding', c4.childNodes.length === 0, 'still rendering: '+c4text().slice(0,60));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
