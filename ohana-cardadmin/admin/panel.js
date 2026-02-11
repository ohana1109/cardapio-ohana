document.addEventListener('DOMContentLoaded', () => {
  const adminSecret = 'ohana-super-secreto';
  let menuData = { items: [] };
  let originalMenuData = ''; // To compare for changes

  const loadingEl = document.getElementById('loading');
  const menuGridEl = document.getElementById('menuGrid');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  
  // Modal elements
  const modal = document.getElementById('itemModal');
  const modalTitle = document.getElementById('modalTitle');
  const itemForm = document.getElementById('itemForm');
  const closeModalBtn = document.querySelector('.close-btn');
  const newItemBtn = document.getElementById('newItemBtn');

  // Form fields
  const modalItemId = document.getElementById('modalItemId');
  const nameInput = document.getElementById('name');
  const descInput = document.getElementById('desc');
  const priceInput = document.getElementById('price');
  const catInput = document.getElementById('cat');
  const imgInput = document.getElementById('img');
  const imgPreview = document.getElementById('img-preview');
  const activeInput = document.getElementById('active');

  // --- INITIALIZATION ---
  async function init() {
    try {
      loadingEl.textContent = 'Carregando cardápio...';
      loadingEl.style.display = 'block';
      menuGridEl.style.display = 'none';

      const response = await fetch('/.netlify/functions/get-menu');
      if (!response.ok) throw new Error('Falha ao carregar o cardápio.');

      menuData = await response.json();
      originalMenuData = JSON.stringify(menuData); // Save initial state

      renderMenu();

    } catch (error) {
      loadingEl.textContent = `Erro: ${error.message}`;
      console.error(error);
    } finally {
      loadingEl.style.display = 'none';
      menuGridEl.style.display = 'grid';
    }
  }

  // --- RENDERING ---
  function renderMenu() {
    menuGridEl.innerHTML = '';
    if (!menuData.items || menuData.items.length === 0) {
      menuGridEl.innerHTML = '<p>Nenhum item no cardápio ainda. Clique em "Novo Item" para começar.</p>';
      return;
    }
    menuData.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.innerHTML = `
        <img src="${item.img || 'https://via.placeholder.com/300x180.png?text=Sem+Imagem'}" alt="${item.name}">
        <div class="menu-card-content">
          <h3>${item.name}</h3>
          <p>R$ ${item.price}</p>
          <small>Categoria: ${item.cat}</small><br>
          <small>Ativo: ${item.active ? 'Sim' : 'Não'}</small>
        </div>
        <div class="menu-card-actions">
          <button class="btn btn-secondary edit-btn" data-id="${item.id}">Editar</button>
          <button class="btn btn-danger delete-btn" data-id="${item.id}">Excluir</button>
        </div>
      `;
      menuGridEl.appendChild(card);
    });
  }

  // --- EVENT LISTENERS ---
  saveChangesBtn.addEventListener('click', saveChanges);
  newItemBtn.addEventListener('click', handleNewItem);
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });

  menuGridEl.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-btn')) {
      handleEditItem(target.dataset.id);
    }
    if (target.classList.contains('delete-btn')) {
      handleDeleteItem(target.dataset.id);
    }
  });

  itemForm.addEventListener('submit', handleFormSubmit);


  // --- MODAL AND FORM LOGIC ---
  function openModal(item) {
    itemForm.reset();
    imgPreview.style.display = 'none';
    
    if (item) { // Editing existing item
      modalTitle.textContent = 'Editar Item';
      modalItemId.value = item.id;
      nameInput.value = item.name;
      descInput.value = item.desc;
      priceInput.value = item.price;
      catInput.value = item.cat;
      activeInput.checked = item.active;
      if (item.img) {
        imgPreview.src = item.img;
        imgPreview.style.display = 'block';
      }
    } else { // Adding new item
      modalTitle.textContent = 'Novo Item';
      modalItemId.value = ''; // No ID yet
    }
    modal.style.display = 'flex';
  }

  function handleNewItem() {
    openModal(null);
  }

  function handleEditItem(id) {
    const item = menuData.items.find(i => i.id === id);
    if (item) {
      openModal(item);
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const id = modalItemId.value || `item-${Date.now()}`;
    
    let imageUrl = imgPreview.src;
    const imageFile = imgInput.files[0];

    if (imageFile) {
      saveChangesBtn.disabled = true;
      saveChangesBtn.textContent = 'Enviando imagem...';
      try {
        const base64Image = await toBase64(imageFile);
        const response = await fetch('/.netlify/functions/upload-image', {
          method: 'POST',
          headers: { 'admin-secret': adminSecret },
          body: JSON.stringify({
            filename: `${id}-${imageFile.name}`,
            body: base64Image
          })
        });
        if (!response.ok) throw new Error('Falha no upload da imagem.');
        const data = await response.json();
        imageUrl = data.url;
      } catch (error) {
        alert(`Erro no upload da imagem: ${error.message}`);
        return;
      } finally {
        saveChangesBtn.disabled = false;
        saveChangesBtn.textContent = 'Salvar Alterações';
      }
    }
    
    const updatedItem = {
      id: id,
      name: nameInput.value,
      desc: descInput.value,
      price: parseFloat(priceInput.value),
      cat: catInput.value,
      active: activeInput.checked,
      img: imageUrl
    };

    if (modalItemId.value) { // Editing
      const index = menuData.items.findIndex(i => i.id === id);
      menuData.items[index] = updatedItem;
    } else { // Adding
      menuData.items.push(updatedItem);
    }
    
    renderMenu();
    modal.style.display = 'none';
    alert('Item salvo localmente. Clique em "Salvar Alterações" para publicar.');
  }

  function handleDeleteItem(id) {
    if (confirm(`Tem certeza que deseja excluir o item "${id}"?`)) {
      menuData.items = menuData.items.filter(i => i.id !== id);
      renderMenu();
      alert('Item excluído localmente. Clique em "Salvar Alterações" para publicar.');
    }
  }


  // --- SAVING AND UPLOADING ---
  async function saveChanges() {
    if (JSON.stringify(menuData) === originalMenuData) {
      alert('Nenhuma alteração para salvar.');
      return;
    }

    saveChangesBtn.disabled = true;
    saveChangesBtn.textContent = 'Salvando...';

    try {
      const response = await fetch('/.netlify/functions/update-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-secret': adminSecret
        },
        body: JSON.stringify(menuData)
      });
      if (!response.ok) throw new Error('O servidor retornou um erro.');
      
      originalMenuData = JSON.stringify(menuData); // Update original state
      alert('Cardápio salvo com sucesso! As alterações estarão no ar em breve.');

    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      saveChangesBtn.disabled = false;
      saveChangesBtn.textContent = 'Salvar Alterações';
    }
  }

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // --- START THE APP ---
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
            console.log('User accepted the Admin App install prompt');
          } else {
            console.log('User dismissed the Admin App install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });

});
