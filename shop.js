/* Ghetto Hustler Clothing - Shop, sizes, search, cart and WhatsApp order.
   Business setup: replace WHATSAPP_NUMBER with your number in international format,
   digits only (South Africa example: 27721234567). Do not include +, spaces or dashes.
*/
document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '27835682049'; // <-- ADD YOUR BUSINESS WHATSAPP NUMBER HERE.
  // Read the editable product catalogue directly from Shop page.html.
  // This keeps product photos, descriptions and prices together in the HTML.
  const catalogueElement = document.getElementById('product-catalogue');
  const productsData = catalogueElement ? JSON.parse(catalogueElement.textContent) : [];
  const grid = document.getElementById('product-grid');
  const search = document.getElementById('product-search');
  const resultMessage = document.getElementById('results-message');
  const emptyMessage = document.getElementById('empty-results');
  const filters = [...document.querySelectorAll('.filter-button')];
  const cart = [];
  const money = amount => 'R' + Number(amount).toFixed(2).replace('.00','');

  // Create one heading and one dedicated product grid for each category.
  const categoryOrder = ['Hoodies', 'Sweaters', 'T-Shirts', 'Headwear', 'Bags'];
  const categoryGrids = {};
  categoryOrder.forEach(category => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.dataset.category = category;
    const heading = document.createElement('h2');
    heading.className = 'category-heading';
    heading.textContent = category;
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'product-grid category-product-grid';
    categoryGrid.dataset.category = category;
    section.append(heading, categoryGrid);
    grid.appendChild(section);
    categoryGrids[category] = { section, grid: categoryGrid };
  });

  // Build product cards from the supplied product photos and place each in its category.
  function renderProducts() {
    Object.values(categoryGrids).forEach(group => group.grid.replaceChildren());
    const fragments = {};
    categoryOrder.forEach(category => fragments[category] = document.createDocumentFragment());

    productsData.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = 'product-image';
      card.dataset.category = product.category;
      card.dataset.search = (product.name + ' ' + product.description + ' ' + product.category + ' ' + product.image).toLowerCase();
      card.dataset.index = index;

      const image = document.createElement('img');
      image.src = product.image;
      image.alt = product.name;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', 'View ' + product.name + ' full screen');
      image.addEventListener('click', () => openPhoto(product.image, product.name));
      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPhoto(product.image, product.name);
        }
      });

      const heading = document.createElement('h3');
      heading.textContent = product.name;
      const description = document.createElement('p');
      description.className = 'product-description';
      description.textContent = product.description;
      // Colour choices are editable for each product in the catalogue in Shop page.html.
      const colourPicker = document.createElement('label');
      colourPicker.className = 'product-colour';
      colourPicker.textContent = 'Colour: ';
      const colourSelect = document.createElement('select');
      colourSelect.className = 'product-colour-select';
      colourSelect.setAttribute('aria-label', 'Colour for ' + product.name);
      (Array.isArray(product.colors) && product.colors.length ? product.colors : ['As shown in product photo'])
        .forEach(colourName => {
          const option = document.createElement('option');
          option.value = colourName;
          option.textContent = colourName;
          colourSelect.appendChild(option);
        });
      colourPicker.appendChild(colourSelect);
      const price = document.createElement('p');
      price.className = product.price > 0 ? 'product-price' : 'product-price price-pending';
      price.textContent = product.price > 0 ? money(product.price) : 'Price to be confirmed';
      card.append(image, heading, description, colourPicker);

      // Size selection is compulsory for hoodies, sweaters and T-shirts.
      if (['Hoodies', 'Sweaters', 'T-Shirts'].includes(product.category)) {
        const picker = document.createElement('div');
        picker.className = 'size-picker';
        const label = document.createElement('span');
        label.textContent = 'Select size (required)';
        picker.appendChild(label);
        ['Small','Medium','Large'].forEach(size => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'size-option';
          button.textContent = size;
          button.addEventListener('click', () => {
            picker.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            card.dataset.selectedSize = size;
          });
          picker.appendChild(button);
        });
        card.appendChild(picker);
      }
      card.appendChild(price);
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'cart-add-button';
      add.textContent = 'Add to Cart';
      add.addEventListener('click', () => {
        const needsSize = ['Hoodies','Sweaters','T-Shirts'].includes(product.category);
        const size = card.dataset.selectedSize || '';
        if (needsSize && !size) {
          alert('Please select Small, Medium or Large before adding this product to your cart.');
          return;
        }
        if (!product.price) {
          alert('The price for this item has not been added yet. Please contact the business to confirm the price.');
          return;
        }
        const selectedColour = colourSelect.value;
        const existing = cart.find(item => item.image === product.image && item.size === size && item.selectedColour === selectedColour);
        if (existing) existing.quantity += 1;
        else cart.push({...product, size, selectedColour, quantity:1});
        updateCartCount();
        add.textContent = 'Added ✓';
        setTimeout(() => add.textContent = 'Add to Cart', 900);
      });
      card.appendChild(add);
      (fragments[product.category] || fragments['Hoodies']).appendChild(card);
    });

    categoryOrder.forEach(category => categoryGrids[category].grid.appendChild(fragments[category]));
    applyFilters();
  }

  // Search and category filtering work together and display the number of matching products.
  let activeCategory = 'All';
  function applyFilters() {
    const term = (search?.value || '').trim().toLowerCase();
    let count = 0;
    categoryOrder.forEach(category => {
      const group = categoryGrids[category];
      let categoryCount = 0;
      [...group.grid.children].forEach(card => {
        const categoryMatch = activeCategory === 'All' || card.dataset.category === activeCategory;
        const searchMatch = card.dataset.search.includes(term);
        const show = categoryMatch && searchMatch;
        card.hidden = !show;
        if (show) { count++; categoryCount++; }
      });
      // Hide the entire category section when the selected filter/search has no matches.
      group.section.hidden = categoryCount === 0;
      group.section.querySelector('.category-heading').textContent =
        `${category} (${categoryCount})`;
    });
    resultMessage.textContent = `Showing ${count} product${count === 1 ? '' : 's'}`;
    emptyMessage.hidden = count !== 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    activeCategory = button.dataset.category;
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
  document.getElementById('clear-search')?.addEventListener('click', () => {
    search.value = '';
    applyFilters();
  });

  // Cart modal, product thumbnails and running total.
  const backdrop = document.createElement('div');
  backdrop.id = 'shop-modal-backdrop';
  backdrop.innerHTML = '<div class="shop-modal" role="dialog" aria-modal="true" aria-labelledby="shop-modal-title"><button class="modal-close" type="button">✕ Close</button><div id="shop-modal-content"></div></div>';
  document.body.appendChild(backdrop);
  const content = backdrop.querySelector('#shop-modal-content');
  const close = () => backdrop.classList.remove('open');
  backdrop.querySelector('.modal-close').addEventListener('click', close);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });

  function updateCartCount() {
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const count = document.getElementById('cart-button-count');
    const label = document.getElementById('cart-count');
    if (count) count.textContent = quantity;
    if (label) label.textContent = `Cart: ${quantity} item${quantity === 1 ? '' : 's'}`;
  }
  function showCart() {
    content.innerHTML = '<h2 id="shop-modal-title">Your Shopping Cart</h2>';
    if (!cart.length) content.insertAdjacentHTML('beforeend', '<p>Your cart is empty.</p>');
    cart.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-line';
      const img = document.createElement('img');
      img.src = item.image; img.alt = item.name;
      img.addEventListener('click', () => openPhoto(item.image, item.name));
      const details = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = item.name;
      const desc = document.createElement('div'); desc.textContent = item.description;
      const colour = document.createElement('div'); colour.textContent = `Colour: ${item.selectedColour || 'As shown in product photo'}`;
      const size = document.createElement('div'); size.className = 'cart-item-size'; size.textContent = item.size ? `Size: ${item.size}` : 'Size: Not applicable';
      const qty = document.createElement('div'); qty.textContent = `Quantity: ${item.quantity}`;
      const price = document.createElement('div'); price.textContent = money(item.price) + ' each';
      details.append(title, desc, colour, size, qty, price);
      const remove = document.createElement('button'); remove.textContent = 'Remove';
      remove.addEventListener('click', () => { cart.splice(index, 1); updateCartCount(); showCart(); });
      row.append(img, details, remove); content.appendChild(row);
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalLine = document.createElement('p'); totalLine.className = 'cart-total'; totalLine.textContent = 'Total: ' + money(total);
    content.appendChild(totalLine);
    if (cart.length) {
      const order = document.createElement('button'); order.className = 'order-button'; order.textContent = 'Order on WhatsApp';
      order.addEventListener('click', showDeliveryForm); content.appendChild(order);
    }
    backdrop.classList.add('open');
  }
  // Full-screen product photo viewer. Close with the X, backdrop click or Escape.
  function openPhoto(src, name) {
    let viewer = document.getElementById('product-fullscreen-viewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'product-fullscreen-viewer';
      viewer.className = 'product-fullscreen-viewer';
      viewer.innerHTML = `
        <button type="button" class="fullscreen-close" aria-label="Close full-screen image">×</button>
        <img alt="">
        <p class="fullscreen-caption"></p>`;
      document.body.appendChild(viewer);
      viewer.querySelector('.fullscreen-close').addEventListener('click', () => viewer.classList.remove('open'));
      viewer.addEventListener('click', event => {
        if (event.target === viewer) viewer.classList.remove('open');
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') viewer.classList.remove('open');
      });
    }
    const fullImage = viewer.querySelector('img');
    fullImage.src = src;
    fullImage.alt = name;
    viewer.querySelector('.fullscreen-caption').textContent = name;
    viewer.classList.add('open');
  }

  // Delivery details: South African province dropdown and town field.
  function showDeliveryForm() {
    content.innerHTML = `
      <h2 id="shop-modal-title">PEP PAXI Delivery Details</h2>
      <form id="customer-order-form" class="customer-order-form">
        <label for="customer-name">Customer full name</label>
        <input id="customer-name" name="customerName" type="text" required maxlength="80" autocomplete="name">
        <label for="customer-province">Province</label>
        <select id="customer-province" name="province" required>
          <option value="">Select province</option>
          <option>Eastern Cape</option><option>Free State</option><option>Gauteng</option>
          <option>KwaZulu-Natal</option><option>Limpopo</option><option>Mpumalanga</option>
          <option>Northern Cape</option><option>North West</option><option>Western Cape</option>
        </select>
        <label for="paxi-town">Town</label>
        <input id="paxi-town" name="town" type="text" required maxlength="100" autocomplete="address-level2">
        <button class="order-button" type="submit">Done – Continue to WhatsApp</button>
      </form>`;
    content.querySelector('#customer-order-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
        alert('Please add your business WhatsApp number in shop.js. Example: 27721234567');
        return;
      }
      const name = form.elements.customerName.value.trim();
      const province = form.elements.province.value;
      const town = form.elements.town.value.trim();
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const lines = cart.map((item, i) =>
        `${i+1}. ${item.name}\nDescription: ${item.description}\nCategory: ${item.category}\nColour: ${item.selectedColour || 'As shown in product photo'}\nSize: ${item.size || 'Not applicable'}\nQuantity: ${item.quantity}\nUnit price: ${money(item.price)}`
      );
      const message = [
        'GHETTO HUSTLER CLOTHING – NEW ORDER','',
        `Customer: ${name}`,`Province: ${province}`,`Town: ${town}`,'Delivery: PEP PAXI','',
        'ORDER DETAILS:', ...lines,'',`TOTAL: ${money(total)}`,
        '', 'Please confirm payment and collection details on WhatsApp.'
      ].join('\n');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });
  }

  document.getElementById('open-cart')?.addEventListener('click', showCart);
  renderProducts();
  updateCartCount();
});
