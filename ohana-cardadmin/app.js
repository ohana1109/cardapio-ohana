/*
  Ohana Snack House — Cardápio Premium
  Versão: Observações por Item
*/

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const CONFIG = {
  whatsapp: "5535996700123", 
  businessName: "Ohana Snack House",
  waHeader: "Olá! Gostaria de fazer um pedido:",
  
  // Configuração dos Horários (Todos os dias das 11h às 15h)
  hours: {
    0: { open: '11:00', close: '15:00' }, // Domingo
    1: { open: '11:00', close: '15:00' }, // Segunda
    2: { open: '11:00', close: '15:00' }, // Terça
    3: { open: '11:00', close: '15:00' }, // Quarta
    4: { open: '11:00', close: '15:00' }, // Quinta
    5: { open: '11:00', close: '15:00' }, // Sexta
    6: { open: '11:00', close: '15:00' }  // Sábado
  }
};

// CATEGORIAS
const CATS = [
  { id: 'executivos', name: 'Executivos' },
  { id: 'mineira', name: 'Especiais Mineiros' },
  { id: 'parmegiana', name: 'Parmegianas' },
  { id: 'alacarte', name: 'À La Carte (2 Pessoas)' },
  { id: 'sucos', name: 'Sucos Naturais' },
  { id: 'refri', name: 'Refrigerantes' },
  { id: 'cervejas', name: 'Cervejas' },
  { id: 'sobremesas', name: 'Sobremesas' },
];

// FALLBACK DATA
const FALLBACK_MENU = [
  { id:'ex-costela', name:'Costela Assada Premium', cat:'executivos', price:39.00, img:'assets/img/costela-assada.jpg', desc:'Costela bovina lentamente assada. Acompanha arroz, feijão, escolha entre fritas ou mandioca, legumes vaporizados e mix de folhas.' },
  { id:'ex-mignon', name:'Filé Mignon Clássico', cat:'executivos', price:46.00, img:'assets/img/mignon.jpg', desc:'Grelhado ou à milanesa. Com arroz, feijão, fritas/mandioca, legumes e salada.' },
  { id:'mi-costela', name:'Costela à Mineira', cat:'mineira', price:44.00, img:'assets/img/mineiro.jpg', desc:'A autêntica experiência mineira: tutu, couve, arroz, torresmo crocante e ovo.' },
  { id:'pa-mignon', name:'Parmegiana de Mignon', cat:'parmegiana', price:52.00, img:'assets/img/parmegiana.jpg', desc:'Molho de tomate artesanal e queijo gratinado. Acompanha arroz e fritas.' },
  { id:'ac-parm', name:'Parmegiana para Dois', cat:'alacarte', price:108.00, img:'assets/img/a-la-carte.jpg', desc:'Generosa porção de mignon à parmegiana para compartilhar. Arroz e fritas inclusos.' },
  { id:'sb-pudim', name:'Pudim de Doce de Leite', cat:'sobremesas', price:23.00, img:'assets/img/pudim.jpg', desc:'Textura cremosa inigualável.' },
  { id:'rf-coca', name:'Coca Cola', cat:'refri', price:8.00, img:'assets/img/refrigerante.jpg', desc:'Lata 350ml.' },
];

let MENU = [];

async function loadMenu(){
  try{
    const res = await fetch('/.netlify/functions/get-menu');
    if(!res.ok) throw new Error('Erro ao carregar o cardápio');
    const data = await res.json();
    // A função agora garante que `items` sempre exista.
    MENU = data.items.map(x => ({...x, active: x.active !== false}));
  }catch(e){
    console.warn('Usando menu fallback', e);
    MENU = FALLBACK_MENU;
  }
}

const els = {
  chips: document.getElementById('chips'),
  grid: document.getElementById('menuGrid'),
  empty: document.getElementById('emptyState'),
  
  searchTrigger: document.getElementById('toggleSearchBtn'),
  favTrigger: document.getElementById('toggleFavsBtn'), 
  searchBar: document.getElementById('searchBar'),
  searchInput: document.getElementById('searchInput'),
  searchClose: document.getElementById('closeSearchBtn'),

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
  openStatus: document.getElementById('openStatus'),
};

const LS = { favs: 'ohana_favs_v2', cart: 'ohana_cart_v2', notes: 'ohana_notes_v2' };
const state = {
  cat: 'all',
  query: '', 
  favs: new Set(JSON.parse(localStorage.getItem(LS.favs) || '[]')),
  cart: JSON.parse(localStorage.getItem(LS.cart) || '{}'),
  notes: JSON.parse(localStorage.getItem(LS.notes) || '{}') // Armazena observações por ID { 'id-item': 'texto' }
};

function save(){
  localStorage.setItem(LS.favs, JSON.stringify([...state.favs]));
  localStorage.setItem(LS.cart, JSON.stringify(state.cart));
  localStorage.setItem(LS.notes, JSON.stringify(state.notes));
}

function buildChips(){
  if(!els.chips) return;
  els.chips.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'chip';
  allBtn.textContent = 'Todos';
  allBtn.dataset.id = 'all';
  allBtn.setAttribute('aria-pressed', 'true');
  allBtn.onclick = () => filterCat('all');
  els.chips.appendChild(allBtn);

  CATS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = c.name;
    btn.dataset.id = c.id;
    btn.onclick = () => filterCat(c.id);
    els.chips.appendChild(btn);
  });
}

function filterCat(id){
  state.cat = id;
  [...els.chips.children].forEach(c => 
    c.setAttribute('aria-pressed', c.dataset.id === id)
  );
  
  if(id !== 'favs' && els.favTrigger) els.favTrigger.classList.remove('active');

  const offset = 80;
  if (els.grid) {
    const gridPos = els.grid.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({top: gridPos, behavior: 'smooth'});
  }
  
  render();
}

function toggleFavsMode(){
  if(els.searchBar && els.searchBar.classList.contains('visible')){
    toggleSearch(false);
  } else if(state.query){
    state.query = '';
    if(els.searchInput) els.searchInput.value = '';
  }

  if(state.cat === 'favs'){
    filterCat('all');
  } else {
    state.cat = 'favs';
    [...els.chips.children].forEach(c => c.setAttribute('aria-pressed', 'false'));
    els.favTrigger.classList.add('active');
    render();
  }
}

function getFiltered(){
  const q = state.query.toLowerCase().trim();
  return MENU.filter(i => {
    if(!i.active) return false;
    if(q) {
      const hay = `${i.name} ${i.desc}`.toLowerCase();
      return hay.includes(q);
    }
    if(state.cat === 'favs') return state.favs.has(i.id);
    if(state.cat !== 'all' && i.cat !== state.cat) return false;
    return true;
  });
}

function render(){
  const items = getFiltered();
  if(els.grid) els.grid.innerHTML = '';
  
  if(items.length === 0){
    if(els.empty) {
      els.empty.hidden = false;
      const title = els.empty.querySelector('h3');
      const desc = els.empty.querySelector('p');
      if(state.cat === 'favs'){
        title.textContent = "Sem favoritos ainda";
        desc.textContent = "Marque pratos com o coração para vê-los aqui.";
      } else {
        title.textContent = "Nenhum prato encontrado";
        desc.textContent = "Tente outro termo na busca.";
      }
    }
    return;
  }
  if(els.empty) els.empty.hidden = true;

  const groups = {};
  items.forEach(i => {
    if(!groups[i.cat]) groups[i.cat] = [];
    groups[i.cat].push(i);
  });

  const catsOrder = (state.query || state.cat === 'favs') ? Object.keys(groups) : CATS.map(c=>c.id);

  catsOrder.forEach(catId => {
    if(!groups[catId]) return;
    
    const title = document.createElement('h3');
    title.className = 'sectionTitle';
    title.textContent = CATS.find(c=>c.id===catId)?.name || 'Outros';
    if(els.grid) els.grid.appendChild(title);

    groups[catId].forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      const isFav = state.favs.has(item.id);
      
      el.innerHTML = `
        <div class="card__media">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='assets/img/hero-ohana.jpg'">
          <button class="card__fav" aria-label="Favoritar">${isFav ? '❤️' : '♡'}</button>
        </div>
        <div class="card__body">
          <div class="card__title">${item.name}</div>
          <div class="card__desc">${item.desc}</div>
          <div class="card__footer">
            <div class="price">${BRL.format(item.price)}</div>
            <button class="btn--add">+</button>
          </div>
        </div>
      `;
      
      el.querySelector('.card__fav').onclick = (e) => {
        e.stopPropagation();
        toggleFav(item.id);
        render(); 
      };
      
      el.querySelector('.btn--add').onclick = () => {
        addToCart(item.id);
      };
      
      if(els.grid) els.grid.appendChild(el);
    });
  });
}

function toggleFav(id){
  if(state.favs.has(id)) state.favs.delete(id);
  else state.favs.add(id);
  save();
}

function toggleSearch(show){
  if(show){
    els.searchTrigger.style.display = 'none';
    els.chips.classList.add('hidden');
    els.searchBar.classList.add('visible');
    els.searchInput.focus();
  } else {
    els.searchBar.classList.remove('visible');
    els.chips.classList.remove('hidden');
    els.searchTrigger.style.display = 'flex';
    els.searchInput.value = '';
    state.query = '';
    render();
  }
}

function addToCart(id){
  state.cart[id] = (state.cart[id] || 0) + 1;
  save(); updateCartUI();
}
function removeOne(id){
  if(state.cart[id] > 0) state.cart[id]--;
  if(state.cart[id] === 0) {
    delete state.cart[id];
    delete state.notes[id]; // Limpa nota se remover item
  }
  save(); updateCartUI();
}
function removeAll(id){
  delete state.cart[id];
  delete state.notes[id]; // Limpa nota se remover item
  save(); updateCartUI();
}

function updateCartUI(){
  const entries = Object.entries(state.cart).map(([id, qty]) => {
    const item = MENU.find(x=>x.id===id);
    return item ? {item, qty} : null;
  }).filter(Boolean);

  const totalQty = entries.reduce((a,b)=>a+b.qty, 0);
  const totalVal = entries.reduce((a,b)=>a+(b.item.price * b.qty), 0);

  if(els.cartCount) {
    els.cartCount.textContent = totalQty;
    els.cartCount.style.display = totalQty > 0 ? 'flex' : 'none';
  }
  
  if(els.drawerSub) els.drawerSub.textContent = `${totalQty} item(ns)`;
  if(els.subtotal) els.subtotal.textContent = BRL.format(totalVal);
  if(els.total) els.total.textContent = BRL.format(totalVal);

  if(els.cartList) {
    els.cartList.innerHTML = '';
    entries.forEach(({item, qty}) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      
      // Recupera nota salva ou vazio
      const itemNote = state.notes[item.id] || '';

      div.innerHTML = `
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${BRL.format(item.price)}</div>
          
          <!-- CAMPO DE OBSERVAÇÃO INDIVIDUAL -->
          <input type="text" class="cart-item__note" placeholder="Alguma observação neste item?" value="${itemNote}">
          
          <div class="cart-controls">
            <button class="cart-btn minus">-</button>
            <span class="cart-qty">${qty}</span>
            <button class="cart-btn plus">+</button>
          </div>
        </div>
        <button class="cart-remove">remover</button>
      `;
      
      // Eventos
      div.querySelector('.minus').onclick = () => removeOne(item.id);
      div.querySelector('.plus').onclick = () => addToCart(item.id);
      div.querySelector('.cart-remove').onclick = () => removeAll(item.id);
      
      // Salva nota ao digitar
      div.querySelector('.cart-item__note').oninput = (e) => {
        state.notes[item.id] = e.target.value;
        save();
      };

      els.cartList.appendChild(div);
    });
  }
}

function openDrawer(){ 
  if(els.drawer) els.drawer.classList.add('is-open'); 
  if(els.overlay) els.overlay.hidden = false; 
}
function closeDrawer(){ 
  if(els.drawer) els.drawer.classList.remove('is-open'); 
  setTimeout(()=> { if(els.overlay) els.overlay.hidden=true; }, 300); 
}

function sendWA(){
  const entries = Object.entries(state.cart).map(([id,q]) => ({ i: MENU.find(x=>x.id===id), q})).filter(x=>x.i);
  if(entries.length === 0) return alert('Sua sacola está vazia.');

  let text = `*${CONFIG.businessName}*\n${CONFIG.waHeader}\n\n`;
  let total = 0;
  
  entries.forEach(({i, q}) => {
    const sub = i.price * q;
    total += sub;
    text += `▪ ${q}x ${i.name}\n   ${BRL.format(sub)}`;
    
    // Adiciona nota individual se existir
    if(state.notes[i.id] && state.notes[i.id].trim()){
      text += `\n   _(Obs: ${state.notes[i.id]})_`;
    }
    text += `\n`;
  });
  
  // Observação Geral
  if(els.obs && els.obs.value.trim()){
    text += `\n📝 *Obs Geral:* ${els.obs.value.trim()}\n`;
  }
  
  text += `\n*TOTAL: ${BRL.format(total)}*`;
  
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
}

function checkOpenStatus() {
  if(!els.openStatus) return;
  
  const now = new Date();
  const day = now.getDay(); 
  const minutes = now.getHours() * 60 + now.getMinutes();
  
  const today = CONFIG.hours[day];
  
  if (!today) {
    els.openStatus.textContent = "🔴 Fechado hoje";
    return;
  }

  const [openH, openM] = today.open.split(':').map(Number);
  const [closeH, closeM] = today.close.split(':').map(Number);
  const start = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  if (minutes >= start && minutes < end) {
    els.openStatus.textContent = `🟢 Aberto agora • Fecha às ${today.close}`;
  } else if (minutes < start) {
    els.openStatus.textContent = `🔴 Fechado • Abre às ${today.open}`;
  } else {
    els.openStatus.textContent = `🔴 Fechado agora`;
  }
}

async function init(){
  if(els.year) els.year.textContent = new Date().getFullYear();
  await loadMenu();
  buildChips();
  render();
  updateCartUI();
  
  if(els.openCart) els.openCart.onclick = openDrawer;
  if(els.closeCart) els.closeCart.onclick = closeDrawer;
  if(els.overlay) els.overlay.onclick = closeDrawer;
  
  if(els.checkout) els.checkout.onclick = sendWA;
  if(els.clearCart) els.clearCart.onclick = () => { if(confirm('Esvaziar?')) { state.cart={}; state.notes={}; save(); updateCartUI(); } };

  if(els.searchTrigger) els.searchTrigger.onclick = () => toggleSearch(true);
  if(els.searchClose) els.searchClose.onclick = () => toggleSearch(false);
  if(els.favTrigger) els.favTrigger.onclick = toggleFavsMode;

  if(els.searchInput) els.searchInput.oninput = (e) => {
    state.query = e.target.value;
    render();
  };

  checkOpenStatus();
  setInterval(checkOpenStatus, 60000);
}

init();

// --- PWA Install Prompt Logic ---
let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');
const installButton = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  if (installBanner) {
    installBanner.style.display = 'flex';
  }

  if (installButton) {
    installButton.addEventListener('click', () => {
      // Hide the app provided install promotion
      installBanner.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});
