// Amma Kitchen Salem CRM Dashboard JS Controller

// 1. Initialize State
let ordersState = [];
let menuState = [];
let customersState = [];
let couponsState = [];

// Connect to Socket.io (Served from same host)
const socket = io();

// Play sound on new order
function playNewOrderSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, audioContext.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio alert not allowed by browser permissions:', e);
  }
}

// Custom Premium Toast Notification
function showToastNotification(message) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = 'var(--bg-surface)';
  toast.style.border = '1px solid var(--accent-color)';
  toast.style.color = 'var(--text-main)';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'var(--font-family)';
  toast.style.fontSize = '13px';
  toast.style.fontWeight = '600';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.style.animation = 'fadeIn 0.3s ease';
  
  toast.innerHTML = `<i data-lucide="bell" style="color:var(--accent-color);width:16px;height:16px;"></i> <span>${message}</span>`;
  document.body.appendChild(toast);
  
  if (window.lucide) window.lucide.createIcons();
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize Lucide Icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 2. Tab Switching logic
const navButtons = document.querySelectorAll('.nav-btn');
const tabViews = document.querySelectorAll('.tab-view');
const tabTitle = document.getElementById('tab-title');
const tabSubtitle = document.getElementById('tab-subtitle');

const tabMeta = {
  orders: { title: 'Live Orders Board', subtitle: 'Real-time order tracking and dispatch console' },
  menu: { title: 'Menu Manager', subtitle: 'Toggle food availability and update base pricing' },
  coupons: { title: 'Coupons Control Panel', subtitle: 'Create, validate, and manage customer discount codes' },
  customers: { title: 'Registered Customers', subtitle: 'Profiles and addresses of home food lovers in Salem' },
  analytics: { title: 'Sales Analytics', subtitle: 'Key performance metrics and revenue analytics' },
  seniors: { title: 'Senior Citizens Monitored', subtitle: 'Dietary alerts and rider guidelines for Salem seniors' }
};

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    
    // Toggle nav active state
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Toggle view active state
    tabViews.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active');
    
    // Update headers
    tabTitle.innerText = tabMeta[tab].title;
    tabSubtitle.innerText = tabMeta[tab].subtitle;
    
    // Fetch data for specific tabs
    if (tab === 'menu') loadMenuData();
    if (tab === 'coupons') loadCouponsData();
    if (tab === 'customers') loadCustomersData();
    if (tab === 'analytics') renderAnalytics();
    if (tab === 'seniors') loadSeniorsData();
  });
});

// 3. Load Live Orders Kanban Data
async function loadOrdersData() {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('Failed to load orders');
    ordersState = await response.json();
    renderKanbanBoard();
    updateDashboardStats();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// 4. Render Kanban Board Columns
function renderKanbanBoard() {
  const columns = {
    Received: document.getElementById('cards-received'),
    Preparing: document.getElementById('cards-preparing'),
    'Out for Delivery': document.getElementById('cards-delivery'),
    Delivered: document.getElementById('cards-delivered')
  };
  
  // Clear columns
  Object.values(columns).forEach(col => {
    if (col) col.innerHTML = '';
  });
  
  const counts = { Received: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 };
  
  ordersState.forEach(order => {
    const status = order.status || 'Received';
    if (!columns[status]) return;
    
    counts[status]++;
    const cardEl = createOrderCard(order);
    columns[status].appendChild(cardEl);
  });
  
  // Update badges
  document.getElementById('count-received').innerText = counts.Received;
  document.getElementById('count-preparing').innerText = counts.Preparing;
  document.getElementById('count-delivery').innerText = counts['Out for Delivery'];
  document.getElementById('count-delivered').innerText = counts.Delivered;
  
  // Update sidebar badge for new/received orders
  const sidebarBadge = document.getElementById('incoming-count');
  sidebarBadge.innerText = counts.Received > 0 ? counts.Received : '';
  
  // Sync live numbers to stat numbers
  document.getElementById('stat-received').innerText = counts.Received;
  document.getElementById('stat-preparing').innerText = counts.Preparing;
  document.getElementById('stat-dispatched').innerText = counts['Out for Delivery'];
  document.getElementById('stat-delivered').innerText = counts.Delivered;
  
  refreshIcons();
}

// Create Kanban Card HTML Element
function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  if (order.status === 'Received') {
    card.classList.add('new-order-flash');
  }
  
  const formattedPrice = parseFloat(order.total).toFixed(2);
  const itemsHtml = order.items.map(item => `
    <div class="card-item-row">
      <span class="card-item-qty">${item.quantity}x</span>
      <span>${item.item.name}</span>
    </div>
  `).join('');
  
  let notesHtml = '';
  if (order.notes) {
    notesHtml = `<div class="card-notes"><i data-lucide="info" style="width:11px;height:11px;display:inline;margin-right:2px;"></i> ${order.notes}</div>`;
  }
  
  let actionBtnText = '';
  let nextStatus = '';
  let actionIcon = '';
  
  if (order.status === 'Received') {
    actionBtnText = 'Start Preparing';
    nextStatus = 'Preparing';
    actionIcon = 'flame';
  } else if (order.status === 'Preparing') {
    actionBtnText = 'Dispatch Rider';
    nextStatus = 'Out for Delivery';
    actionIcon = 'truck';
  } else if (order.status === 'Out for Delivery') {
    actionBtnText = 'Complete Order';
    nextStatus = 'Delivered';
    actionIcon = 'check-circle-2';
  }
  
  let actionButton = '';
  if (order.status === 'Preparing') {
    actionButton = `
      <div style="margin-top: 8px; width: 100%; display: flex; flex-direction: column; gap: 6px;">
        <select class="rider-select" id="rider-select-${order.id}" style="width: 100%; padding: 8px; border-radius: 6px; background: #111620; border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 11px; outline: none; font-weight: 600;">
          <option value="Ramesh Kumar|+918667519735">Ramesh Kumar (Salem Central)</option>
          <option value="Arun Prasath|+919944882233">Arun Prasath (Hasthampatti)</option>
          <option value="Suresh Karthik|+919789332211">Suresh Karthik (Fairlands)</option>
        </select>
        <button class="card-action-btn" onclick="assignRiderAndDispatch('${order.id}')" style="width: 100%;">
          <i data-lucide="truck"></i>
          <span>Dispatch Rider</span>
        </button>
      </div>
    `;
  } else if (actionBtnText) {
    actionButton = `
      <button class="card-action-btn" onclick="updateOrderStatus('${order.id}', '${nextStatus}')">
        <i data-lucide="${actionIcon}"></i>
        <span>${actionBtnText}</span>
      </button>
    `;
  }
  
  let riderInfoHtml = '';
  if (order.rider_name) {
    riderInfoHtml = `
      <div class="card-notes" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #10B981; margin-top: 6px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
        <i data-lucide="bike" style="width:11px;height:11px;"></i>
        <span>Rider: ${order.rider_name} (${order.rider_phone.substring(order.rider_phone.length - 10)})</span>
      </div>
    `;
  }
  
  const isPaid = order.payment_status === 'Paid';
  const payBadgeHtml = `
    <span class="pay-badge ${isPaid ? 'paid' : 'pending'}" style="font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px; background: ${isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)'}; color: ${isPaid ? '#10B981' : '#FBBF24'}; text-transform: uppercase; margin-left: 6px; vertical-align: middle;">
      ${order.payment_status || 'Pending'}
    </span>
  `;
  
  const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  card.innerHTML = `
    <div class="card-header-row">
      <span class="card-order-number">${order.order_number}</span>
      <span class="card-order-time">${orderTime}</span>
    </div>
    <div class="card-items-list">
      ${itemsHtml}
    </div>
    ${notesHtml}
    ${riderInfoHtml}
    <div class="card-address">
      <i data-lucide="map-pin"></i>
      <span>${order.delivery_address}</span>
    </div>
    <div class="card-footer-row" style="flex-wrap: wrap; gap: 8px;">
      <div>
        <span class="card-price">₹${formattedPrice}</span>
        ${payBadgeHtml}
      </div>
      ${order.status !== 'Preparing' ? actionButton : ''}
    </div>
    ${order.status === 'Preparing' ? actionButton : ''}
  `;
  
  return card;
}

// 5. Update Status trigger REST API Call
async function assignRiderAndDispatch(orderId) {
  const selectEl = document.getElementById(`rider-select-${orderId}`);
  if (!selectEl) return;
  const [riderName, riderPhone] = selectEl.value.split('|');
  
  try {
    const response = await fetch(`/api/orders/${orderId}/rider`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ riderName, riderPhone })
    });
    
    if (!response.ok) throw new Error('Failed to assign rider');
    
    const updated = await response.json();
    ordersState = ordersState.map(o => o.id === orderId ? { ...o, status: 'Out for Delivery', rider_name: riderName, rider_phone: riderPhone } : o);
    renderKanbanBoard();
    updateDashboardStats();
  } catch (error) {
    console.error('Error assigning rider:', error);
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update status');
    
    ordersState = ordersState.map(o => o.id === orderId ? { ...o, status } : o);
    renderKanbanBoard();
    updateDashboardStats();
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

// 6. Update Dashboard Mini Stats Strip
function updateDashboardStats() {
  const counts = ordersState.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, { Received: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 });
  
  document.getElementById('stat-received').innerText = counts.Received;
  document.getElementById('stat-preparing').innerText = counts.Preparing;
  document.getElementById('stat-dispatched').innerText = counts['Out for Delivery'];
  document.getElementById('stat-delivered').innerText = counts.Delivered;
}

// 7. Load and Render Menu tab
async function loadMenuData() {
  try {
    const response = await fetch('/api/menu');
    if (!response.ok) throw new Error('Failed to load menu');
    menuState = await response.json();
    renderMenuManager();
  } catch (error) {
    console.error('Error fetching menu items:', error);
  }
}

function renderMenuManager() {
  const tableBody = document.getElementById('menu-items-table-body');
  tableBody.innerHTML = '';
  
  menuState.forEach(item => {
    const row = document.createElement('tr');
    
    const formattedPrice = parseFloat(item.price).toFixed(2);
    const availabilityText = item.is_available ? 'Available' : 'Sold Out';
    const availabilityClass = item.is_available ? 'available' : 'sold-out';
    const isChecked = item.is_available ? 'checked' : '';
    const vegBadge = item.is_veg 
      ? '<span style="color:#10b981; font-weight:800; font-size:10px; border:1px solid #10b981; padding:1px 4px; border-radius:3px; margin-right:4px;">VEG</span>'
      : '<span style="color:#ef4444; font-weight:800; font-size:10px; border:1px solid #ef4444; padding:1px 4px; border-radius:3px; margin-right:4px;">NON-VEG</span>';
    
    row.innerHTML = `
      <td>
        <div class="dish-cell">
          <img src="${item.image}" alt="${item.name}">
          <div class="dish-text">
            <h4>${vegBadge}${item.name}</h4>
            <p>${item.subtitle || ''}</p>
          </div>
        </div>
      </td>
      <td>
        <span class="category-badge">${item.category}</span>
      </td>
      <td>
        <input type="number" value="${formattedPrice}" onchange="updateMenuPrice('${item.id}', this.value)" style="width: 70px; background:var(--bg-surface); border:1px solid var(--border-color); color:#fff; padding:6px; border-radius:4px; font-weight:700;">
      </td>
      <td>
        <span>⭐ ${parseFloat(item.rating || 5.0).toFixed(1)} (${item.review_count || 0})</span>
      </td>
      <td>
        <span class="status-indicator-badge ${availabilityClass}">${availabilityText}</span>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn-table-action" onclick="openEditMenuModal('${item.id}')">Edit</button>
          <label class="switch">
            <input type="checkbox" ${isChecked} onchange="toggleMenuAvailability('${item.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Update menu item availability REST
async function toggleMenuAvailability(itemId, isAvailable) {
  try {
    const response = await fetch(`/api/menu/${itemId}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isAvailable })
    });
    if (!response.ok) throw new Error('Failed to update availability');
    
    menuState = menuState.map(m => m.id === itemId ? { ...m, is_available: isAvailable } : m);
    renderMenuManager();
  } catch (error) {
    console.error('Error toggling menu availability:', error);
  }
}

// Update menu price REST
async function updateMenuPrice(itemId, price) {
  try {
    const response = await fetch(`/api/menu/${itemId}/price`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ price: parseFloat(price) })
    });
    if (!response.ok) throw new Error('Failed to update price');
    
    menuState = menuState.map(m => m.id === itemId ? { ...m, price: parseFloat(price) } : m);
    renderMenuManager();
  } catch (error) {
    console.error('Error updating price:', error);
  }
}

// Menu Modals Control
function openAddMenuModal() {
  document.getElementById('modal-menu-title').innerText = 'Add New Dish';
  document.getElementById('menu-item-id').value = '';
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-subtitle').value = '';
  document.getElementById('menu-price').value = '';
  document.getElementById('menu-original-price').value = '';
  document.getElementById('menu-category').value = 'Traditional Specials';
  document.getElementById('menu-prep-time').value = '15 mins';
  document.getElementById('menu-serving-size').value = 'Serves 1';
  document.getElementById('menu-calories').value = '320 kcal';
  document.getElementById('menu-is-veg').checked = true;
  document.getElementById('menu-is-popular').checked = false;
  document.getElementById('menu-description').value = '';
  document.getElementById('menu-long-description').value = '';
  document.getElementById('menu-image').value = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  
  document.getElementById('modal-menu').classList.add('active');
  refreshIcons();
}

function openEditMenuModal(itemId) {
  const item = menuState.find(m => m.id === itemId);
  if (!item) return;
  
  document.getElementById('modal-menu-title').innerText = 'Edit Dish Details';
  document.getElementById('menu-item-id').value = item.id;
  document.getElementById('menu-name').value = item.name;
  document.getElementById('menu-subtitle').value = item.subtitle || '';
  document.getElementById('menu-price').value = item.price;
  document.getElementById('menu-original-price').value = item.original_price || '';
  document.getElementById('menu-category').value = item.category;
  document.getElementById('menu-prep-time').value = item.prep_time || '15 mins';
  document.getElementById('menu-serving-size').value = item.serving_size || 'Serves 1';
  document.getElementById('menu-calories').value = item.calories || '320 kcal';
  document.getElementById('menu-is-veg').checked = !!item.is_veg;
  document.getElementById('menu-is-popular').checked = !!item.is_popular;
  document.getElementById('menu-description').value = item.description || '';
  document.getElementById('menu-long-description').value = item.long_description || '';
  document.getElementById('menu-image').value = item.image || '';
  
  document.getElementById('modal-menu').classList.add('active');
  refreshIcons();
}

function closeMenuModal() {
  document.getElementById('modal-menu').classList.remove('active');
}

async function saveMenuItem() {
  const id = document.getElementById('menu-item-id').value;
  const name = document.getElementById('menu-name').value;
  const subtitle = document.getElementById('menu-subtitle').value;
  const price = document.getElementById('menu-price').value;
  const original_price = document.getElementById('menu-original-price').value;
  const category = document.getElementById('menu-category').value;
  const prep_time = document.getElementById('menu-prep-time').value;
  const serving_size = document.getElementById('menu-serving-size').value;
  const calories = document.getElementById('menu-calories').value;
  const is_veg = document.getElementById('menu-is-veg').checked;
  const is_popular = document.getElementById('menu-is-popular').checked;
  const description = document.getElementById('menu-description').value;
  const long_description = document.getElementById('menu-long-description').value;
  const image = document.getElementById('menu-image').value;
  
  if (!name || !price || !category) {
    alert('Name, Price, and Category are required!');
    return;
  }
  
  const payload = {
    name, subtitle, price: parseFloat(price), 
    original_price: original_price ? parseFloat(original_price) : null,
    category, prep_time, serving_size, calories, is_veg, is_popular,
    description, long_description, image
  };
  
  try {
    const isEdit = !!id;
    const url = isEdit ? `/api/menu/${id}` : '/api/menu';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Failed to save menu item');
    
    showToastNotification(`Dish ${isEdit ? 'updated' : 'added'} successfully!`);
    closeMenuModal();
    loadMenuData();
  } catch (error) {
    console.error('Error saving menu item:', error);
    alert('Error saving menu item');
  }
}

// 8. Load Customers Data
async function loadCustomersData() {
  try {
    const response = await fetch('/api/crm/users');
    if (!response.ok) throw new Error('Failed to load customers');
    customersState = await response.json();
    renderCustomers();
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

function renderCustomers() {
  const tableBody = document.getElementById('customers-table-body');
  tableBody.innerHTML = '';
  
  customersState.forEach(cust => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${cust.name}</strong></td>
      <td>${cust.phone}</td>
      <td>${cust.email || 'No email'}</td>
      <td><span style="font-weight: 750; color: #FBBF24;"><i data-lucide="award" style="width:12px;height:12px;display:inline;margin-right:2px;vertical-align:middle;"></i> ${cust.points_balance} Pts</span></td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="btn-table-action" onclick="adjustCustomerPoints('${cust.id}', 50)" style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3);">+50 Pts</button>
          <button class="btn-table-action" onclick="adjustCustomerPoints('${cust.id}', -50)" style="background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3);">-50 Pts</button>
          <button class="btn-table-action" onclick="openBroadcastModal('${cust.name}', '${cust.phone}')" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3);">Alert</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  refreshIcons();
}

async function adjustCustomerPoints(userId, points) {
  try {
    const response = await fetch(`/api/users/${userId}/loyalty/add-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });
    if (!response.ok) throw new Error('Failed to adjust points');
    
    showToastNotification('Points updated successfully.');
    loadCustomersData();
  } catch (error) {
    console.error('Error adjusting points:', error);
  }
}

// 9. Load Seniors Data
async function loadSeniorsData() {
  try {
    const response = await fetch('/api/crm/elder-profiles');
    if (!response.ok) throw new Error('Failed to load elder profiles');
    const profiles = await response.json();
    
    const tableBody = document.getElementById('seniors-table-body');
    tableBody.innerHTML = '';
    
    profiles.forEach(elder => {
      const row = document.createElement('tr');
      let dietLabel = 'No Restriction';
      let alertClass = 'available';
      if (elder.dietary_restriction === 'low-salt') {
        dietLabel = 'Low Salt/Spice';
        alertClass = 'sold-out';
      } else if (elder.dietary_restriction === 'diabetic-friendly') {
        dietLabel = 'Diabetic Friendly';
        alertClass = 'sold-out';
      } else if (elder.dietary_restriction === 'soft-chew') {
        dietLabel = 'Soft Easy Chew';
        alertClass = 'sold-out';
      }
      
      row.innerHTML = `
        <td><strong>${elder.name}</strong></td>
        <td>${elder.sponsor_name || 'Akarsh Raj'}</td>
        <td>${elder.phone}</td>
        <td>${elder.address}</td>
        <td><span class="status-indicator-badge ${alertClass}" style="font-size: 11px;">${dietLabel}</span></td>
        <td><em style="color: #94A3B8;">"${elder.delivery_notes || 'No custom guideline'}"</em></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-table-action" onclick="openDietModal('${elder.id}', '${elder.name}', '${elder.dietary_restriction}', '${elder.delivery_notes || ''}')" style="background: rgba(232, 90, 42, 0.15); color: var(--accent-color); border-color: rgba(232, 90, 42, 0.3);">Edit Care</button>
            <button class="btn-table-action" onclick="openBroadcastModal('${elder.name}', '${elder.phone}')" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3);">Alert</button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading seniors data:', error);
  }
  refreshIcons();
}

// Senior Diet Settings Modal
function openDietModal(id, name, restriction, notes) {
  document.getElementById('diet-elder-id').value = id;
  document.getElementById('diet-elder-name').value = name;
  document.getElementById('diet-restriction').value = restriction || 'none';
  document.getElementById('diet-notes').value = notes || '';
  
  document.getElementById('modal-diet').classList.add('active');
  refreshIcons();
}

function closeDietModal() {
  document.getElementById('modal-diet').classList.remove('active');
}

async function saveElderDietary() {
  const id = document.getElementById('diet-elder-id').value;
  const restriction = document.getElementById('diet-restriction').value;
  const notes = document.getElementById('diet-notes').value;
  
  try {
    const response = await fetch(`/api/crm/elder-profiles/${id}/diet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dietaryRestriction: restriction,
        deliveryNotes: notes
      })
    });
    
    if (!response.ok) throw new Error('Failed to update dietary guidelines');
    
    showToastNotification('Elderly patient guidelines updated.');
    closeDietModal();
    loadSeniorsData();
  } catch (error) {
    console.error('Error saving dietary specs:', error);
  }
}

// 10. Load Coupons Data Panel
async function loadCouponsData() {
  try {
    const response = await fetch('/api/coupons');
    if (!response.ok) throw new Error('Failed to load coupons');
    couponsState = await response.json();
    renderCoupons();
  } catch (error) {
    console.error('Error fetching coupons:', error);
  }
}

function renderCoupons() {
  const tableBody = document.getElementById('coupons-table-body');
  tableBody.innerHTML = '';
  
  couponsState.forEach(c => {
    const row = document.createElement('tr');
    const isChecked = c.is_active ? 'checked' : '';
    const statusText = c.is_active ? 'Active' : 'Disabled';
    const statusClass = c.is_active ? 'available' : 'sold-out';
    const discountDisplay = c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`;
    const formattedDate = new Date(c.created_at).toLocaleDateString();
    
    row.innerHTML = `
      <td><strong>${c.code}</strong></td>
      <td>${discountDisplay}</td>
      <td><span class="category-badge">${c.discount_type === 'percent' ? 'Percentage' : 'Flat Off'}</span></td>
      <td><span class="status-indicator-badge ${statusClass}">${statusText}</span></td>
      <td>${formattedDate}</td>
      <td>
        <label class="switch">
          <input type="checkbox" ${isChecked} onchange="toggleCouponActive('${c.code}', this.checked)">
          <span class="slider"></span>
        </label>
      </td>
    `;
    tableBody.appendChild(row);
  });
  refreshIcons();
}

async function toggleCouponActive(code, activeState) {
  try {
    const response = await fetch(`/api/coupons/${code}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: activeState })
    });
    if (!response.ok) throw new Error('Failed to update status');
    
    showToastNotification(`Promo ${code} is now ${activeState ? 'active' : 'disabled'}.`);
    loadCouponsData();
  } catch (error) {
    console.error('Error toggling coupon status:', error);
  }
}

function openAddCouponModal() {
  document.getElementById('coupon-code').value = '';
  document.getElementById('coupon-value').value = '';
  document.getElementById('coupon-type').value = 'fixed';
  
  document.getElementById('modal-coupon').classList.add('active');
  refreshIcons();
}

function closeCouponModal() {
  document.getElementById('modal-coupon').classList.remove('active');
}

async function saveCouponCode() {
  const code = document.getElementById('coupon-code').value.toUpperCase();
  const val = document.getElementById('coupon-value').value;
  const type = document.getElementById('coupon-type').value;
  
  if (!code || !val) {
    alert('Code and Discount Value are required!');
    return;
  }
  
  try {
    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discountValue: parseInt(val), discountType: type })
    });
    
    if (!response.ok) throw new Error('Failed to create coupon');
    
    showToastNotification(`Coupon ${code} created successfully!`);
    closeCouponModal();
    loadCouponsData();
  } catch (error) {
    console.error('Error creating coupon:', error);
  }
}

// 11. WhatsApp Alert Hub
function openBroadcastModal(name, phone) {
  document.getElementById('broadcast-phone').value = phone;
  document.getElementById('broadcast-name').value = name;
  document.getElementById('broadcast-recipient-display').value = `${name} (${phone})`;
  document.getElementById('broadcast-template').value = 'custom';
  document.getElementById('broadcast-message').value = '';
  
  document.getElementById('modal-broadcast').classList.add('active');
  refreshIcons();
}

function closeBroadcastModal() {
  document.getElementById('modal-broadcast').classList.remove('active');
}

function applyBroadcastTemplate(val) {
  const name = document.getElementById('broadcast-name').value;
  let message = '';
  
  if (val === 'dispatched') {
    message = `Hi ${name}, your hot homestyle meals have been freshly prepared by Amma's Kitchen and handed to our rider. You can track your rider live in the application! Enjoy!`;
  } else if (val === 'dietary') {
    message = `Greetings from Amma's Kitchen, ${name}. We have custom-prepared your parent's meal following the low salt and soft इजी-चू parameters. It is packed hygienically and will be delivered shortly.`;
  } else if (val === 'loyalty') {
    message = `Congratulations ${name}! As a valued regular guest of Amma's Kitchen, we have credited 50 bonus loyalty points to your profile. Redeem them for free meals on your next checkout!`;
  }
  
  document.getElementById('broadcast-message').value = message;
}

async function sendAlertBroadcast() {
  const phone = document.getElementById('broadcast-phone').value;
  const name = document.getElementById('broadcast-name').value;
  const message = document.getElementById('broadcast-message').value;
  
  if (!message) {
    alert('Message body cannot be empty!');
    return;
  }
  
  try {
    const response = await fetch('/api/crm/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, customerName: name, message, type: 'WhatsApp' })
    });
    
    if (!response.ok) throw new Error('Failed to send broadcast');
    
    showToastNotification(`Simulated WhatsApp alert sent to ${name}.`);
    closeBroadcastModal();
  } catch (error) {
    console.error('Error broadcasting alert:', error);
    alert('Error sending alert broadcast');
  }
}

// 12. Render Sales Analytics tab
function renderAnalytics() {
  const todayOrders = ordersState.length;
  const totalRevenue = ordersState.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const aov = todayOrders > 0 ? (totalRevenue / todayOrders) : 0;
  
  document.getElementById('analytics-revenue').innerText = `₹${totalRevenue.toFixed(2)}`;
  document.getElementById('analytics-orders').innerText = todayOrders;
  document.getElementById('analytics-aov').innerText = `₹${aov.toFixed(2)}`;
  
  // Categorized items statistics
  const categoryCounts = {};
  ordersState.forEach(o => {
    o.items.forEach(cartItem => {
      const category = cartItem.item.category || 'Meals';
      categoryCounts[category] = (categoryCounts[category] || 0) + cartItem.quantity;
    });
  });
  
  const maxSales = Math.max(...Object.values(categoryCounts), 1);
  const categoryListEl = document.getElementById('category-analytics-list');
  categoryListEl.innerHTML = '';
  
  Object.keys(categoryCounts).forEach(category => {
    const qty = categoryCounts[category];
    const percentage = (qty / maxSales) * 100;
    
    const row = document.createElement('div');
    row.className = 'category-row';
    row.innerHTML = `
      <span class="category-name">${category}</span>
      <div class="category-bar-bg">
        <div class="category-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <span class="category-sales">${qty} items sold</span>
    `;
    categoryListEl.appendChild(row);
  });
}

// 13. Real-time WebSocket Listeners
socket.on('new_order', (newOrder) => {
  console.log('Received new order notification via WebSocket:', newOrder);
  playNewOrderSound();
  showToastNotification(`New order placed: ${newOrder.order_number}`);
  
  ordersState.unshift(newOrder);
  renderKanbanBoard();
  updateDashboardStats();
  
  const activeTab = document.querySelector('.nav-btn.active').getAttribute('data-tab');
  if (activeTab === 'analytics') renderAnalytics();
});

socket.on('order_status_update', (data) => {
  console.log('Received order status sync update:', data);
  ordersState = ordersState.map(o => o.id === data.id ? { ...o, status: data.status } : o);
  renderKanbanBoard();
  updateDashboardStats();
});

socket.on('crm_notification_sent', (data) => {
  console.log('Received CRM notification sync event:', data);
  showToastNotification(`Broadcast successfully sent to ${data.customerName}!`);
});

// Theme Toggle (Light / Dark)
function initTheme() {
  const currentTheme = localStorage.getItem('crm-theme') || 'light';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon('light');
  } else {
    document.body.classList.remove('light-theme');
    updateThemeIcon('dark');
  }
}

function toggleThemeScheme() {
  const isLight = document.body.classList.contains('light-theme');
  if (isLight) {
    document.body.classList.remove('light-theme');
    localStorage.setItem('crm-theme', 'dark');
    updateThemeIcon('dark');
  } else {
    document.body.classList.add('light-theme');
    localStorage.setItem('crm-theme', 'light');
    updateThemeIcon('light');
  }
}

function updateThemeIcon(theme) {
  const iconEl = document.getElementById('theme-toggle-icon');
  if (!iconEl) return;
  
  if (theme === 'light') {
    iconEl.setAttribute('data-lucide', 'moon');
  } else {
    iconEl.setAttribute('data-lucide', 'sun');
  }
  
  refreshIcons();
}

// Boot operations
initTheme();
loadOrdersData();
setInterval(loadOrdersData, 30000); // Polling fallback every 30s
