/*
  Ohana Snack House — Cardápio Premium (estático)
  - categorias (chips) + agrupamento por seção
  - favoritos (localStorage)
  - sacola com contador, +/−, remover
  - observação e envio por WhatsApp
  - QR Code (modal) via qrcodejs
  - PWA: install prompt (opcional)
*/

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ✅ CONFIG
const CONFIG = {
  whatsapp: "5535996700123", // Ex: 5511999999999 (sem + e sem espaços)
  businessName: "Ohana Snack House",
};

// ✅ CATEGORIAS
const CATS = [
  { id: 'executivos', name: 'Pratos Executivos' },
  { id: 'mineira', name: 'Comida Mineira' },
  { id: 'parmegiana', name: 'Parmegianas' },
  { id: 'alacarte', name: 'À la carte (2 pessoas)' },
  { id: 'sucos', name: 'Sucos' },
  { id: 'refri', name: 'Refrigerantes' },
  { id: 'cervejas', name: 'Cervejas (lata)' },
  { id: 'sobremesas', name: 'Sobremesas' },
];

// ✅ ITENS (extraídos do PDF)
const FALLBACK_MENU = [
  // Executivos
  { id:'ex-costela', name:'Costela assada (boi)', cat:'executivos', price:39.00, img:'assets/img/costela-assada.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-mignon', name:'Filé mignon grelhado ou à milanesa', cat:'executivos', price:46.00, img:'assets/img/mignon.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-frango', name:'Filé de frango grelhado ou à milanesa', cat:'executivos', price:31.00, img:'assets/img/frango.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-tilapia', name:'Filé de tilápia grelhado ou à milanesa', cat:'executivos', price:38.00, img:'assets/img/tilapia.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-sobrecoxa', name:'Sobrecoxa desossada', cat:'executivos', price:34.00, img:'assets/img/sobrecoxa.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-pernil', name:'Pernil acebolado', cat:'executivos', price:32.00, img:'assets/img/pernil.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-shiitake', name:'Vegano: shiitake (cogumelo)', cat:'executivos', price:37.00, img:'assets/img/shiitake.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-omelete', name:'Vegetariano: omelete (consulte opções)', cat:'executivos', price:34.00, img:'assets/img/omelete.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-fitness', name:'Fitness: grelhado + salada caprichada (consulte opções)', cat:'executivos', price:30.00, img:'assets/img/fitness.jpg', desc:'Opção leve com salada caprichada — consulte opções.' },
  { id:'ex-frango-grat', name:'Frango gratinado (queijo, tomate, orégano)', cat:'executivos', price:35.00, img:'assets/img/frango-gratinado.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-mignon-grat', name:'Mignon gratinado (queijo, tomate, orégano)', cat:'executivos', price:48.00, img:'assets/img/mignon-gratinado.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },
  { id:'ex-strog', name:'Strogonoff de filé mignon', cat:'executivos', price:47.00, img:'assets/img/strogonoff-mignon.jpg', desc:'Acompanha arroz, feijão, fritas OU mandioca, legumes no vapor e mix de folhas.' },

  // Mineira
  { id:'mi-costela', name:'Costela mineira (serve 1 pessoa)', cat:'mineira', price:44.00, img:'assets/img/mineiro.jpg', desc:'Acompanha tutu de feijão, couve, arroz, torresmo e ovo frito.' },
  { id:'mi-pernil', name:'Pernil mineiro (serve 1 pessoa)', cat:'mineira', price:38.00, img:'assets/img/mineiro.jpg', desc:'Acompanha tutu de feijão, couve, arroz, torresmo e ovo frito.' },
  { id:'mi-frango', name:'Frango mineiro (serve 1 pessoa)', cat:'mineira', price:37.00, img:'assets/img/mineiro.jpg', desc:'Acompanha tutu de feijão, couve, arroz, torresmo e ovo frito.' },
  { id:'mi-tilapia', name:'Tilápia mineira (serve 1 pessoa)', cat:'mineira', price:44.00, img:'assets/img/mineiro.jpg', desc:'Acompanha tutu de feijão, couve, arroz, torresmo e ovo frito.' },
  { id:'mi-mignon', name:'Mignon mineiro (serve 1 pessoa)', cat:'mineira', price:52.00, img:'assets/img/mineiro.jpg', desc:'Acompanha tutu de feijão, couve, arroz, torresmo e ovo frito.' },

  // Parmegianas
  { id:'pa-mignon', name:'Parmegiana de filé mignon', cat:'parmegiana', price:52.00, img:'assets/img/parmegiana.jpg', desc:'Acompanha arroz e fritas.' },
  { id:'pa-tilapia', name:'Parmegiana de filé de tilápia', cat:'parmegiana', price:37.00, img:'assets/img/parmegiana.jpg', desc:'Acompanha arroz e fritas.' },
  { id:'pa-frango', name:'Parmegiana de filé de frango', cat:'parmegiana', price:38.00, img:'assets/img/parmegiana.jpg', desc:'Acompanha arroz e fritas.' },
  { id:'pa-berinjela', name:'Parmegiana de berinjela', cat:'parmegiana', price:46.00, img:'assets/img/parmegiana.jpg', desc:'Acompanha arroz e fritas.' },

  // À la carte
  { id:'ac-parm', name:'Filé mignon à parmegiana (2 pessoas)', cat:'alacarte', price:108.00, img:'assets/img/a-la-carte.jpg', desc:'Arroz e fritas.' },
  { id:'ac-cubana', name:'Filé à cubana (2 pessoas)', cat:'alacarte', price:112.00, img:'assets/img/a-la-carte.jpg', desc:'Arroz, fritas, 2 filés mignon à milanesa, banana frita, pêssego em calda e ervilha na manteiga.' },
  { id:'ac-mineiro', name:'Costela ou pernil mineiro (2 pessoas)', cat:'alacarte', price:98.00, img:'assets/img/a-la-carte.jpg', desc:'Tutu de feijão, couve, ovo frito, torresmo, banana à milanesa e arroz.' },
  { id:'ac-salada', name:'Salada especial da casa (consulte opções)', cat:'alacarte', price:15.00, img:'assets/img/salada.jpg', desc:'Consulte as opções disponíveis.' },

  // Sucos
  { id:'su-abacaxi', name:'Suco (1 fruta) — Abacaxi', cat:'sucos', price:10.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-laranja', name:'Suco (1 fruta) — Laranja', cat:'sucos', price:10.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-maracuja', name:'Suco (1 fruta) — Maracujá', cat:'sucos', price:10.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-limao', name:'Suco (1 fruta) — Limão', cat:'sucos', price:10.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-morango', name:'Suco (1 fruta) — Morango', cat:'sucos', price:10.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-2frutas', name:'Suco com 2 frutas', cat:'sucos', price:13.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-acai', name:'Suco com açaí', cat:'sucos', price:14.00, img:'assets/img/suco.jpg', desc:'Jarra.' },
  { id:'su-limonada', name:'Limonada suíça', cat:'sucos', price:14.00, img:'assets/img/limonada.jpg', desc:'Jarra.' },
  { id:'su-detox', name:'Detox', cat:'sucos', price:9.00, img:'assets/img/detox.jpg', desc:'Abacaxi, hortelã, couve, mel e gengibre.' },
  { id:'su-imunidade', name:'Imunidade', cat:'sucos', price:11.00, img:'assets/img/detox.jpg', desc:'Laranja, cenoura e gengibre.' },

  // Refrigerantes
  { id:'rf-coca', name:'Coca Cola', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-zero', name:'Coca Zero', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-fanta', name:'Fanta', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-guarana', name:'Guaraná Antarctica', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-tonica', name:'Água tônica', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-h2o', name:'H2O', cat:'refri', price:11.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-agua', name:'Água', cat:'refri', price:4.00, img:'assets/img/refrigerante.jpg', desc:'' },
  { id:'rf-agua-gas', name:'Água com gás', cat:'refri', price:6.00, img:'assets/img/refrigerante.jpg', desc:'' },

  // Cervejas
  { id:'cv-original', name:'Cerveja (lata) — Original', cat:'cervejas', price:14.00, img:'assets/img/cerveja.jpg', desc:'' },
  { id:'cv-heineken', name:'Cerveja (lata) — Heineken', cat:'cervejas', price:15.00, img:'assets/img/cerveja.jpg', desc:'' },

  // Sobremesas
  { id:'sb-acai', name:'Taça especial açaí', cat:'sobremesas', price:14.00, img:'assets/img/acai.jpg', desc:'' },
  { id:'sb-mousse', name:'Mousse (maracujá ou morango)', cat:'sobremesas', price:19.00, img:'assets/img/mousse.jpg', desc:'' },
  { id:'sb-pudim', name:'Pudim doce de leite', cat:'sobremesas', price:23.00, img:'assets/img/pudim.jpg', desc:'' },
];

let MENU = []; // carregado do /data/menu.json (admin). Fallback se falhar.

async function loadMenu(){
  try{
    const res = await fetch('./data/menu.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    if(!Array.isArray(items) || items.length === 0) throw new Error('menu.json vazio');

    MENU = items
      .filter(x => x && x.id && x.name && x.cat)
      .map(x => ({
        id: String(x.id),
        name: String(x.name),
        cat: String(x.cat),
        price: Number(x.price || 0),
        img: x.img ? String(x.img) : 'assets/img/hero-ohana.jpg',
        desc: x.desc ? String(x.desc) : '',
        active: (x.active !== false)
      }));
  }catch(err){
    console.warn('Falha ao carregar data/menu.json. Usando fallback interno.', err);
    MENU = FALLBACK_MENU.map(x => ({...x, active: (x.active !== false)}));
  }
}

const els = {
  chips: document.getElementById('chips'),
  grid: document.getElementById('menuGrid'),
  empty: document.getElementById('emptyState'),

  search: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),

  cartCount: document.getElementById('cartCount'),
  openCart: document.getElementById('openCartBtn'),
  closeCart: document.getElementById('closeCartBtn'),
  overlay: document.getElementById('overlay'),
  drawer: document.getElementById('drawer'),
  drawerSub: document.getElementById('drawerSub'),
  cartList: document.getElementById('cartList'),
  subtotal: document.getElementById('subtotal'),
  total: document.getElementById('total'),
  checkout: document.getElementById('checkoutBtn'),
  clearCart: document.getElementById('clearCartBtn'),
  obs: document.getElementById('obsInput'),

  year: document.getElementById('year'),
  goToMenu: document.getElementById('goToMenuBtn'),

  openQr: document.getElementById('openQrBtn'),
  qrModal: document.getElementById('qrModal'),
  closeQr: document.getElementById('closeQrBtn'),
  qrBox: document.getElementById('qrBox'),
  qrUrl: document.getElementById('qrUrl'),
  regenQr: document.getElementById('regenQrBtn'),

  installBtn: document.getElementById('installBtn')
};

const LS = {
  favs: 'ohana_favs_v1',
  cart: 'ohana_cart_v1',
  qrurl: 'ohana_qrurl_v1'
};

const state = {
  query: '',
  cat: 'all',
  favs: new Set(JSON.parse(localStorage.getItem(LS.favs) || '[]')),
  cart: JSON.parse(localStorage.getItem(LS.cart) || '{}') // {id: qty}
};

function save(){
  localStorage.setItem(LS.favs, JSON.stringify([...state.favs]));
  localStorage.setItem(LS.cart, JSON.stringify(state.cart));
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildChips(){
  els.chips.innerHTML = '';
  els.chips.appendChild(makeChip('all','Todos', true));
  for(const c of CATS){
    els.chips.appendChild(makeChip(c.id, c.name));
  }
}

function makeChip(id, label, pressed=false){
  const b = document.createElement('button');
  b.className = 'chip';
  b.type = 'button';
  b.dataset.id = id;
  b.textContent = label;
  b.setAttribute('aria-pressed', String(pressed));
  b.addEventListener('click', () => {
    state.cat = id;
    [...els.chips.querySelectorAll('.chip')].forEach(x => x.setAttribute('aria-pressed', String(x.dataset.id === id)));
    render();
  });
  return b;
}

function filtered(){
  const q = state.query.trim().toLowerCase();
  return MENU.filter(it => {
    if(it.active === false) return false;
    const okCat = state.cat === 'all' ? true : it.cat === state.cat;
    if(!okCat) return false;
    if(!q) return true;
    const hay = `${it.name} ${it.desc}`.toLowerCase();
    return hay.includes(q);
  });
}

function render(){
  const items = filtered();
  els.grid.innerHTML = '';

  if(items.length === 0){
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;

  const byCat = new Map();
  for(const it of items){
    if(!byCat.has(it.cat)) byCat.set(it.cat, []);
    byCat.get(it.cat).push(it);
  }

  const order = (state.cat === 'all') ? CATS.map(c=>c.id) : [state.cat];

  for(const catId of order){
    const group = byCat.get(catId);
    if(!group || group.length === 0) continue;

    const title = document.createElement('div');
    title.className = 'sectionTitle';
    title.textContent = CATS.find(c=>c.id===catId)?.name || 'Categoria';
    els.grid.appendChild(title);

    for(const it of group){
      els.grid.appendChild(renderCard(it));
    }
  }
}

function renderCard(it){
  const card = document.createElement('article');
  card.className = 'card';
  const catName = CATS.find(c=>c.id===it.cat)?.name || 'Item';
  const fav = state.favs.has(it.id);

  card.innerHTML = `
    <div class="card__media">
      <img loading="lazy" src="${it.img}" alt="${escapeHtml(it.name)}"
           onerror="this.src='assets/img/hero-ohana.jpg'" />
      <div class="card__badge">${escapeHtml(catName)}</div>
      <button class="card__fav" type="button" aria-label="Favoritar">${fav ? '❤️' : '🤍'}</button>
    </div>
    <div class="card__body">
      <div class="card__title">${escapeHtml(it.name)}</div>
      ${it.desc ? `<div class="card__desc">${escapeHtml(it.desc)}</div>` : ''}
      <div class="card__row">
        <div class="price">${BRL.format(it.price)}</div>
        <button class="btn btn--primary" type="button">Adicionar</button>
      </div>
    </div>
  `;

  const favBtn = card.querySelector('.card__fav');
  favBtn.addEventListener('click', () => {
    if(state.favs.has(it.id)) state.favs.delete(it.id);
    else state.favs.add(it.id);
    save();
    favBtn.textContent = state.favs.has(it.id) ? '❤️' : '🤍';
  });

  const addBtn = card.querySelector('.btn--primary');
  addBtn.addEventListener('click', () => {
    add(it.id);
    addBtn.classList.remove('pop');
    void addBtn.offsetWidth;
    addBtn.classList.add('pop');
  });

  return card;
}

// ---------------- CART ----------------

function add(id){
  state.cart[id] = (state.cart[id] || 0) + 1;
  save();
  updateCart();
}
function dec(id){
  if(!state.cart[id]) return;
  state.cart[id] -= 1;
  if(state.cart[id] <= 0) delete state.cart[id];
  save();
  updateCart();
}
function removeItem(id){
  delete state.cart[id];
  save();
  updateCart();
}
function clearCart(){
  state.cart = {};
  save();
  updateCart();
}

function cartEntries(){
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ item: MENU.find(x=>x.id===id), qty }))
    .filter(x => !!x.item);
}

function updateCart(){
  const entries = cartEntries();
  const count = entries.reduce((s,x)=> s + x.qty, 0);
  els.cartCount.textContent = String(count);
  els.drawerSub.textContent = `${count} item${count===1?'':'s'}`;

  const subtotal = entries.reduce((s,x)=> s + x.item.price * x.qty, 0);
  els.subtotal.textContent = BRL.format(subtotal);
  els.total.textContent = BRL.format(subtotal);

  els.cartList.innerHTML = '';
  if(entries.length === 0){
    els.cartList.innerHTML = `<div class="empty"><div class="empty__emoji">🛒</div><div class="empty__title">Sacola vazia</div><div class="empty__desc">Adicione itens do cardápio para montar seu pedido.</div></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  for(const {item, qty} of entries){
    const row = document.createElement('div');
    row.className = 'cartItem';
    row.innerHTML = `
      <div>
        <div class="cartItem__title">${escapeHtml(item.name)}</div>
        <div class="cartItem__meta">${BRL.format(item.price)} • ${escapeHtml(CATS.find(c=>c.id===item.cat)?.name || '')}</div>
      </div>
      <div class="cartItem__right">
        <div class="qty">
          <button type="button" aria-label="Diminuir">−</button>
          <div class="n">${qty}</div>
          <button type="button" aria-label="Aumentar">+</button>
        </div>
        <button class="removeBtn" type="button">Remover</button>
      </div>
    `;

    const [minus, plus] = row.querySelectorAll('.qty button');
    minus.addEventListener('click', () => dec(item.id));
    plus.addEventListener('click', () => add(item.id));
    row.querySelector('.removeBtn').addEventListener('click', () => removeItem(item.id));

    frag.appendChild(row);
  }
  els.cartList.appendChild(frag);
}

function openDrawer(){
  els.overlay.hidden = false;
  els.drawer.classList.add('is-open');
  els.drawer.setAttribute('aria-hidden','false');
}
function closeDrawer(){
  els.overlay.hidden = true;
  els.drawer.classList.remove('is-open');
  els.drawer.setAttribute('aria-hidden','true');
}

// ---------------- WhatsApp ----------------

function sendWhatsApp(){
  const entries = cartEntries();
  if(entries.length === 0){
    alert('Adicione itens ao pedido.');
    return;
  }

  if(!CONFIG.whatsapp || CONFIG.whatsapp.includes('SEUNUMEROAQUI')){
    alert('Configure o número em CONFIG.whatsapp no app.js (ex: 5511999999999).');
    return;
  }

  const lines = [];
  lines.push(`*Pedido - ${CONFIG.businessName}*`);
  lines.push('');

  let total = 0;
  for(const {item, qty} of entries){
    const val = item.price * qty;
    total += val;
    lines.push(`• ${qty}x ${item.name} — ${BRL.format(val)}`);
  }

  const obs = (els.obs.value || '').trim();
  if(obs){
    lines.push('');
    lines.push(`*Observações:* ${obs}`);
  }

  lines.push('');
  lines.push(`*Total: ${BRL.format(total)}*`);

  const msg = encodeURIComponent(lines.join('\n'));
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, '_blank');
}

// ---------------- QR Code ----------------

function closeQr(){
  els.qrModal.hidden = true;
}

function generateQr(url){
  els.qrBox.innerHTML = '';
  const safe = (url || '').trim();
  if(!safe){
    els.qrBox.innerHTML = '<div style="color:#1C2A22; font-weight:900; text-align:center">Cole a URL publicada do cardápio para gerar o QR.</div>';
    return;
  }

  localStorage.setItem(LS.qrurl, safe);

  qr = new QRCode(els.qrBox, {
    text: safe,
    width: 220,
    height: 220,
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ---------------- PWA install prompt ----------------

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  els.installBtn.hidden = false;
});

async function installPWA(){
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  els.installBtn.hidden = true;
}

// ---------------- Events ----------------

async function boot(){
  els.year.textContent = new Date().getFullYear();

  buildChips();

  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    render();
  });

  els.clearSearch.addEventListener('click', () => {
    els.search.value = '';
    state.query = '';
    render();
    els.search.focus();
  });

  els.openCart.addEventListener('click', openDrawer);
  els.closeCart.addEventListener('click', closeDrawer);

  els.overlay.addEventListener('click', () => {
    closeDrawer();
    
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      closeDrawer();
      
    }
  });

  els.checkout.addEventListener('click', sendWhatsApp);

  els.clearCart.addEventListener('click', () => {
    if(confirm('Limpar a sacola?')) clearCart();
  });

  els.goToMenu.addEventListener('click', () => {
    window.scrollTo({ top: els.grid.offsetTop - 120, behavior: 'smooth' });
  });

      
  els.installBtn.addEventListener('click', installPWA);

  await loadMenu();
  render();
  updateCart();
}

boot();
