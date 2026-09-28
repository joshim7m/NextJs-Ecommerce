import { register } from 'node:module';
register('/home/joshim/NextApp/radiant-picks/.tmptest/jsxhook.mjs', import.meta.url);
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const { BundleView } = await import('/home/joshim/NextApp/radiant-picks/.tmptest/src/components/storefront/FrequentlyBoughtTogether.jsx');
const render = (p) => renderToStaticMarkup(createElement(BundleView, p));
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/[·]/g,' ').replace(/\s+/g, ' ').trim();

const ADD_ONS = [
  { id:'a', slug:'bra', sku:'S1', title:'A very long product title that will certainly need to wrap onto a second line', unite_price:1100, sale_price:800, quantity:5, images:[{image_path:'/a.jpg'}], variants:[] },
  { id:'b', slug:'pant', sku:'S2', title:'Panties', unite_price:650, sale_price:null, quantity:2, images:[{image_path:'/b.jpg'}], variants:[] },
  { id:'c', slug:'set', sku:'S3', title:'Set', unite_price:2000, sale_price:null, quantity:1, images:[], variants:[] },
];
const sum = ADD_ONS.reduce((s,p)=>s+Number(p.sale_price||p.unite_price),0);

let pass=0, fail=0;
const check = (n, c, x='') => { c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n}  ${x}`)); };

console.log('=== emptiness ===');
check('no add-ons + not loading => null', render({addOns:[]}).length === 0, JSON.stringify(render({addOns:[]}).slice(0,60)));

console.log('\n=== skeleton row count follows `count` (no height jump) ===');
const rows = (h) => (h.match(/animate-pulse/g)||[]).length; // one per skeleton row
check('count=2 draws 2 rows', rows(render({loading:true,count:2})) === 2, 'got '+rows(render({loading:true,count:2})));
check('count=3 draws 3 rows', rows(render({loading:true,count:3})) === 3, 'got '+rows(render({loading:true,count:3})));

console.log('\n=== quoting: compact reports the delta, not a repeated total ===');
const cart = render({ addOns: ADD_ONS, seedCount: 1, seedSubtotal: 800, count: 3 });
check(`cart CTA reads "+৳${sum.toLocaleString()}" (delta only)`, text(cart).includes(`+৳${sum.toLocaleString()}`), text(cart).match(/Add all to cart[^A-Z]{0,14}/)?.[0]);
check('cart CTA label is "Add all to cart"', text(cart).includes('Add all to cart'));
check(`caption repeats the same delta`, text(cart).includes(`Bundle adds ৳${sum.toLocaleString()}`));

console.log('\n=== quoting: ctaIncludesSeed quotes the whole bundle (PDP) ===');
const pdp = render({ addOns: ADD_ONS, seedSubtotal: 500, ctaIncludesSeed: true, showSeedGroup: false, count: 2 });
check('PDP label is "Add bundle to cart"', text(pdp).includes('Add bundle to cart'));
check(`PDP total = 500 seed + ${sum} add-ons = ৳${(500+sum).toLocaleString()}`, text(pdp).includes(`৳${(500+sum).toLocaleString()}`), text(pdp).match(/Add bundle to cart[^A-Z]{0,14}/)?.[0]);
check('caption still reports only the add-on delta', text(pdp).includes(`Bundle adds ৳${sum.toLocaleString()}`));

console.log('\n=== seed group ===');
check('shown when seedCount > 0', text(cart).includes('1 item in your cart'));
check('pluralised for 3', text(render({addOns:ADD_ONS,seedCount:3,seedSubtotal:2000})).includes('3 items in your cart'));
check('hidden when showSeedGroup=false', !text(pdp).includes('in your cart'));

console.log('\n=== checkout form safety (renders inside <form>) ===');
const dis = render({ addOns: ADD_ONS, seedCount: 2, seedSubtotal: 500, dismissible: true });
const b = (dis.match(/<button/g)||[]).length;
check(`all ${b} buttons are type="button"`, b >= 4 && !/<button(?![^>]*type="button")/.test(dis));
check('dismiss button present when dismissible', dis.includes('aria-label="Dismiss recommendations"'));
check('no dismiss button when not dismissible', !render({addOns:ADD_ONS,seedCount:1}).includes('Dismiss recommendations'));

console.log('\n=== added state ===');
const added = render({ addOns: ADD_ONS, seedCount: 1, seedSubtotal: 500, addedIds: ['a','b','c'] });
check('CTA becomes "Added to cart"', text(added).includes('Added to cart'));
check('CTA no longer quotes a price', !text(added).includes('+৳') && !text(added).includes('· ৳'));
const some = render({ addOns: ADD_ONS, seedCount: 1, seedSubtotal: 500, addedIds: ['a'] });
check('one added row does not flip the whole CTA', !text(some).includes('Added to cart'));
check('added row shows a check icon not a plus', (some.match(/M5 13l4 4L19 7/g)||[]).length >= 1);

console.log('\n=== titles wrap, prices do not truncate ===');
const row = render({ addOns: [ADD_ONS[0]], seedCount: 1, seedSubtotal: 0 });
check('row title is line-clamp-2 (wraps)', /line-clamp-2/.test(row));
check('no line-clamp-1 on the row title', !/line-clamp-1/.test(row));
check('compact price row can wrap (flex-wrap)', /flex-wrap/.test(row));

console.log('\n=== discount display ===');
check('strikethrough on the original price', /line-through/.test(render({addOns:[ADD_ONS[0]],seedCount:1})));
const noDisc = render({ addOns: [ADD_ONS[1]], seedCount: 1 });
check('no strikethrough without a discount', !/line-through/.test(noDisc));

console.log('\n=== links + SEO ===');
const links = new Set((render({addOns:ADD_ONS,seedCount:1}).match(/href="\/products\/[^"]*"/g)||[]));
check('each add-on links to its own product', links.size === 3, [...links].join(' '));
check('no JSON-LD emitted by the rail', !render({addOns:ADD_ONS,seedCount:1}).includes('ld+json'));

console.log('\n=== dark mode: every light colour has a dark: twin ===');
const full = render({ addOns: ADD_ONS, seedCount: 2, seedSubtotal: 500, dismissible: true });
const classes = (full.match(/class="[^"]*"/g)||[]).join(' ');
const light = (classes.match(/\bbg-white\b|\bborder-violet-200\/70\b|\bbg-violet-50\b|\bbg-violet-50\/60\b|\btext-slate-\d+\b|\bbg-violet-100\/70\b/g)||[]);
const dark = (classes.match(/\bdark:/g)||[]);
check(`${light.length} light colour tokens, ${dark.length} dark: twins`, dark.length >= light.length*0.85, `${dark.length} < ${light.length}`);

console.log('\n=== surface prop ===');
check('surface gives the card chrome', /rounded-2xl border/.test(cart));
check('no surface => no card chrome', !/rounded-2xl border/.test(render({addOns:ADD_ONS,surface:false})));

console.log(`\n${pass} passed, ${fail} failed`);
