// Minimal DOM: react-dom/client only needs a handful of node types and
// createElement/appendChild/setAttribute/textContent to mount and commit.
class Node {
  constructor(type) { this.nodeType = type; this.childNodes = []; this.parentNode = null; this.listeners = {}; }
  appendChild(c) { c.parentNode = this; this.childNodes.push(c); return c; }
  removeChild(c) { this.childNodes = this.childNodes.filter(x => x !== c); c.parentNode = null; return c; }
  insertBefore(n, ref) { const i = this.childNodes.indexOf(ref); i < 0 ? this.appendChild(n) : this.childNodes.splice(i, 0, n); n.parentNode = this; return n; }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  removeEventListener(t, fn) { this.listeners[t] = (this.listeners[t] || []).filter(f => f !== fn); }
  dispatchEvent(e) { (this.listeners[e.type] || []).forEach(f => f(e)); return true; }
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k] ?? null; }
  removeAttribute(k) { delete this[k]; }
  get textContent() { if (this.nodeType === 3) return this.data; return this.childNodes.map(c => c.textContent).join(''); }
  set textContent(v) { this.childNodes = [Object.assign(new Text(String(v)), { data: String(v) })]; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  get firstChild() { return this.childNodes[0] || null; }
  get nextSibling() { if (!this.parentNode) return null; const i = this.parentNode.childNodes.indexOf(this); return this.parentNode.childNodes[i+1] || null; }
}
// React commits text updates by assigning `nodeValue`, so it has to be the
// single source of truth behind textContent for text nodes.
class Text extends Node {
  constructor(d) { super(3); this.data = d; }
  get nodeValue() { return this.data; }
  set nodeValue(v) { this.data = String(v); }
}

class Element extends Node {
  constructor(tag) { super(1); this.tagName = String(tag).toUpperCase(); this.style = {}; this.props = {}; }
  set ownerDocument(d) { this._doc = d; }
  get ownerDocument() { return this._doc; }
  focus() {}
  blur() {}
  click() { if (this.props?.onClick) this.props.onClick(); }
  getBoundingClientRect() { return { top:0,left:0,width:0,height:0,right:0,bottom:0 }; }
  contains() { return false; }
  set innerHTML(v) { this.childNodes = []; }
  get innerHTML() { return ''; }
  set outerHTML(v) { this.parentNode?.removeChild(this); }
  cloneNode() { return new Element(this.tagName); }
}
class DocumentFragment extends Node { constructor() { super(11); } }

const document = Object.assign(new Node(9), {
  createElement: (t) => { const e = new Element(t); e._doc = document; return e; },
  createElementNS: (_ns, t) => { const e = new Element(t); e._doc = document; return e; },
  createTextNode: (d) => Object.assign(new Text(d), { _doc: document }),
  createDocumentFragment: () => new DocumentFragment(),
  createComment: (d) => Object.assign(new Text(d), { nodeType: 8 }),
  createTreeWalker: () => ({ nextNode: () => null, currentNode: null }),
  createRange: () => ({ setStart() {}, setEnd() {}, selectNodeContents() {} }),
  adoptNode: (n) => n,
  documentElement: new Element('html'),
  body: new Element('body'),
  head: new Element('head'),
  activeElement: null,
});

const win = {
  document,
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  addEventListener: (t, fn) => { (win._l[t] ||= []).push(fn); },
  removeEventListener: (t, fn) => { win._l[t] = (win._l[t] || []).filter(f => f !== fn); },
  dispatchEvent: (e) => { (win._l[e.type] || []).forEach(f => f(e)); return true; },
  _l: {},
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
  getComputedStyle: () => new Proxy({}, { get: () => '' }),
  Event: class Event { constructor(type) { this.type = type; } },
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  MutationObserver: class { observe() {} disconnect() {} },
  localStorage: (() => {
    const s = {};
    return { getItem: (k) => (k in s ? s[k] : null), setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; }, clear: () => {}, __raw: s };
  })(),
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  scrollTo() {}, alert() {}, confirm: () => true,
};

// React feature-detects a handful of constructors on window; provide them so the
// commit path takes the simple branch instead of throwing on undefined.
for (const name of ['HTMLIFrameElement','HTMLInputElement','HTMLTextAreaElement','HTMLSelectElement','HTMLFormElement','HTMLVideoElement','HTMLMediaElement','HTMLImageElement','HTMLAnchorElement','HTMLButtonElement','HTMLDivElement','HTMLSpanElement','SVGElement','MathMLElement','HTMLBodyElement','HTMLHtmlElement','HTMLHeadElement','HTMLDocument','Document','Window','CSS','DOMRect','ShadowRoot','HTMLSlotElement','HTMLUnknownElement','HTMLObjectElement','HTMLPictureElement','HTMLSourceElement','HTMLTableElement','HTMLTemplateElement','HTMLStyleElement','HTMLScriptElement','HTMLMetaElement','HTMLLinkElement','HTMLTitleElement','HTMLBaseElement','HTMLAreaElement','HTMLAudioElement','HTMLLIElement','HTMLUListElement','HTMLCanvasElement','HTMLLabelElement','HTMLOutputElement','HTMLProgressElement','HTMLMeterElement','HTMLDetailsElement','HTMLDialogElement','HTMLFieldSetElement','HTMLLegendElement','HTMLMenuElement','HTMLOptGroupElement','HTMLOptionElement','HTMLSelectElement','HTMLTextAreaElement','HTMLIFrameElement']) {
  if (!win[name]) { const C = class extends Element {}; Object.defineProperty(C, 'name', { value: name }); win[name] = C; }
}

globalThis.window = win;
globalThis.document = document;
Object.defineProperty(globalThis, 'navigator', { value: win.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'location', { value: win.location, configurable: true, writable: true });
globalThis.HTMLElement = Element;
globalThis.Node = Node;
globalThis.Text = Text;
globalThis.Element = Element;
globalThis.DocumentFragment = DocumentFragment;
globalThis.MutationObserver = win.MutationObserver;
globalThis.requestAnimationFrame = win.requestAnimationFrame;
globalThis.cancelAnimationFrame = win.cancelAnimationFrame;
globalThis.getComputedStyle = win.getComputedStyle;
globalThis.Event = win.Event;
globalThis.CustomEvent = win.CustomEvent;
globalThis.localStorage = win.localStorage;
globalThis.sessionStorage = win.sessionStorage;
for (const name of ['HTMLIFrameElement','HTMLInputElement','SVGElement','MathMLElement','Document','CSS','DOMRect','ShadowRoot','Node','Element','HTMLElement','Window']) {
  if (win[name]) globalThis[name] = win[name];
}
globalThis.window = win;
globalThis.self = win;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export { document, win };
