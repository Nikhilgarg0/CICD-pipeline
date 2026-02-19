/* ══════════════════════════════════════════
   app.js — RetailOps Main Application
   ══════════════════════════════════════════ */

/* ── Helpers ── */
const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const fmtDate = d => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));

/* ── Toast ── */
function toast(msg, type = 'info') {
    const icons = {
        success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
        error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${msg}</span>`;
    $('toast-container').appendChild(el);
    setTimeout(() => {
        el.classList.add('fade-out');
        el.addEventListener('animationend', () => el.remove());
    }, 3500);
}

/* ── Confirm dialog ── */
function confirm(title, message) {
    return new Promise(resolve => {
        $('confirm-title').textContent = title;
        $('confirm-message').textContent = message;
        $('confirm-overlay').classList.add('open');
        const ok = () => { cleanup(); resolve(true); };
        const cancel = () => { cleanup(); resolve(false); };
        function cleanup() {
            $('confirm-overlay').classList.remove('open');
            $('confirm-ok-btn').removeEventListener('click', ok);
            $('confirm-cancel-btn').removeEventListener('click', cancel);
        }
        $('confirm-ok-btn').addEventListener('click', ok);
        $('confirm-cancel-btn').addEventListener('click', cancel);
    });
}

/* ── Router ── */
let currentPage = 'dashboard';
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    $(`page-${page}`).classList.add('active');
    $(`nav-${page}`).classList.add('active');
    currentPage = page;
    if (page === 'dashboard') loadDashboard();
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
    // Close mobile sidebar
    $('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        navigate(item.dataset.page);
    });
});

$('mobile-menu-toggle').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
});

/* ══════════════════════════════════════════
   HEALTH CHECK
   ══════════════════════════════════════════ */
async function checkHealth() {
    try {
        const data = await API.health();
        const dot = $('health-dot');
        const text = $('health-text');
        if (data.status === 'healthy') {
            dot.className = 'health-dot healthy';
            text.textContent = 'API Online';
        } else {
            dot.className = 'health-dot degraded';
            text.textContent = 'Degraded';
        }
    } catch {
        $('health-dot').className = 'health-dot down';
        $('health-text').textContent = 'API Offline';
    }
}
checkHealth();
setInterval(checkHealth, 30000);

/* ══════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════ */
async function loadDashboard() {
    try {
        const [productsRes, ordersRes, statsRes] = await Promise.all([
            API.getProducts(),
            API.getOrders(),
            API.getOrderStats(),
        ]);

        const products = productsRes.data;
        const stats = statsRes.data;

        // Stat cards
        $('stat-products-val').textContent = products.length;
        $('stat-orders-val').textContent = stats.totalOrders;
        $('stat-revenue-val').textContent = fmt(stats.totalRevenue);
        $('stat-pending-val').textContent = stats.ordersByStatus.pending || 0;

        // Badge counts
        $('products-count-badge').textContent = products.length;
        $('orders-count-badge').textContent = stats.totalOrders;

        // Status breakdown
        const breakdown = $('status-breakdown');
        const total = stats.totalOrders || 1;
        const statuses = ['pending', 'processing', 'completed', 'cancelled'];
        breakdown.innerHTML = statuses.map(s => {
            const count = stats.ordersByStatus[s] || 0;
            const pct = Math.round((count / total) * 100);
            return `
        <div class="status-row">
          <span class="status-row-label">${s}</span>
          <div class="status-bar-track">
            <div class="status-bar-fill ${s}" style="width: 0%;" data-target="${pct}"></div>
          </div>
          <span class="status-row-count">${count}</span>
        </div>
      `;
        }).join('');
        // Animate bars
        requestAnimationFrame(() => {
            breakdown.querySelectorAll('.status-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.target + '%';
            });
        });

        // Top products by stock (invert: lowest stock = moving fast)
        const topProds = [...products]
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);
        const topList = $('top-products-list');
        if (topProds.length === 0) {
            topList.innerHTML = '<p class="text-muted" style="font-size:13px">No products yet.</p>';
        } else {
            topList.innerHTML = topProds.map((p, i) => `
        <div class="top-item">
          <span class="top-item-rank">${i + 1}</span>
          <span class="top-item-name">${escHtml(p.name)}</span>
          <span class="top-item-detail">${p.stock} left · ${fmt(p.price)}</span>
        </div>
      `).join('');
        }

    } catch (err) {
        toast('Failed to load dashboard: ' + err.message, 'error');
    }
}

$('refresh-dashboard-btn').addEventListener('click', () => {
    loadDashboard();
    checkHealth();
    toast('Dashboard refreshed', 'success');
});

/* ══════════════════════════════════════════
   PRODUCTS
   ══════════════════════════════════════════ */
let allProducts = [];
let productFilters = {};

async function loadProducts(filters = {}) {
    const tbody = $('products-tbody');
    tbody.innerHTML = `<tr><td colspan="5" class="table-loading">Loading products...</td></tr>`;
    try {
        const res = await API.getProducts(filters);
        allProducts = res.data;
        $('products-count-badge').textContent = res.count;
        renderProducts(allProducts);
        populateCategoryFilter(allProducts);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-loading">Error: ${escHtml(err.message)}</td></tr>`;
        toast('Failed to load products', 'error');
    }
}

function renderProducts(products) {
    const tbody = $('products-tbody');
    if (!products.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No products found.</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(p => {
        const stockClass = p.stock <= 5 ? 'stock-low' : p.stock <= 20 ? 'stock-med' : 'stock-high';
        return `
      <tr>
        <td>
          <div class="product-name-cell">
            <span>${escHtml(p.name)}</span>
            ${p.description ? `<span class="product-desc">${escHtml(p.description.slice(0, 50))}${p.description.length > 50 ? '…' : ''}</span>` : ''}
          </div>
        </td>
        <td>${p.category ? `<span class="category-badge">${escHtml(p.category)}</span>` : '<span class="text-muted">—</span>'}</td>
        <td class="price-cell">${fmt(p.price)}</td>
        <td class="stock-cell ${stockClass}">${p.stock}</td>
        <td>
          <div class="actions-cell">
            <button class="action-btn edit" title="Edit" onclick="openEditProduct('${p.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn delete" title="Delete" onclick="deleteProduct('${p.id}', '${escHtml(p.name).replace(/'/g, "\\'")}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

function populateCategoryFilter(products) {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const sel = $('product-category-filter');
    const current = sel.value;
    sel.innerHTML = '<option value="">All Categories</option>' +
        cats.map(c => `<option value="${escHtml(c)}" ${c === current ? 'selected' : ''}>${escHtml(c)}</option>`).join('');
}

// Filter listeners
function applyProductFilters() {
    const filters = {
        category: $('product-category-filter').value,
        minPrice: $('product-min-price').value,
        maxPrice: $('product-max-price').value,
    };
    loadProducts(filters);
}
$('product-category-filter').addEventListener('change', applyProductFilters);
$('product-min-price').addEventListener('input', applyProductFilters);
$('product-max-price').addEventListener('input', applyProductFilters);
$('clear-product-filters').addEventListener('click', () => {
    $('product-category-filter').value = '';
    $('product-min-price').value = '';
    $('product-max-price').value = '';
    loadProducts();
});

/* ── Product Modal ── */
function openProductModal(product = null) {
    const form = $('product-form');
    form.reset();
    $('product-id').value = '';
    $('product-name-error').textContent = '';
    $('product-price-error').textContent = '';
    $('product-stock-error').textContent = '';
    ['product-name', 'product-price', 'product-stock'].forEach(id => $(id).classList.remove('error'));

    if (product) {
        $('product-modal-title').textContent = 'Edit Product';
        $('product-submit-btn').textContent = 'Save Changes';
        $('product-id').value = product.id;
        $('product-name').value = product.name || '';
        $('product-description').value = product.description || '';
        $('product-price').value = product.price || '';
        $('product-stock').value = product.stock ?? '';
        $('product-category').value = product.category || '';
    } else {
        $('product-modal-title').textContent = 'Add Product';
        $('product-submit-btn').textContent = 'Add Product';
    }
    $('product-modal-overlay').classList.add('open');
    setTimeout(() => $('product-name').focus(), 100);
}

function closeProductModal() {
    $('product-modal-overlay').classList.remove('open');
}

$('add-product-btn').addEventListener('click', () => openProductModal());
$('product-modal-close').addEventListener('click', closeProductModal);
$('product-cancel-btn').addEventListener('click', closeProductModal);
$('product-modal-overlay').addEventListener('click', e => {
    if (e.target === $('product-modal-overlay')) closeProductModal();
});

$('product-form').addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    const name = $('product-name').value.trim();
    const price = parseFloat($('product-price').value);
    const stock = parseInt($('product-stock').value);

    if (!name) {
        $('product-name-error').textContent = 'Name is required';
        $('product-name').classList.add('error');
        valid = false;
    } else {
        $('product-name-error').textContent = '';
        $('product-name').classList.remove('error');
    }
    if (isNaN(price) || price <= 0) {
        $('product-price-error').textContent = 'Must be a positive number';
        $('product-price').classList.add('error');
        valid = false;
    } else {
        $('product-price-error').textContent = '';
        $('product-price').classList.remove('error');
    }
    if (isNaN(stock) || stock < 0) {
        $('product-stock-error').textContent = 'Must be ≥ 0';
        $('product-stock').classList.add('error');
        valid = false;
    } else {
        $('product-stock-error').textContent = '';
        $('product-stock').classList.remove('error');
    }
    if (!valid) return;

    const submitBtn = $('product-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    const payload = {
        name,
        description: $('product-description').value.trim(),
        price,
        stock,
        category: $('product-category').value.trim(),
    };

    try {
        const id = $('product-id').value;
        if (id) {
            await API.updateProduct(id, payload);
            toast('Product updated successfully', 'success');
        } else {
            await API.createProduct(payload);
            toast('Product created successfully', 'success');
        }
        closeProductModal();
        loadProducts();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = $('product-id').value ? 'Save Changes' : 'Add Product';
    }
});

window.openEditProduct = async (id) => {
    try {
        const res = await API.getProduct(id);
        openProductModal(res.data);
    } catch (err) {
        toast('Failed to load product: ' + err.message, 'error');
    }
};

window.deleteProduct = async (id, name) => {
    const ok = await confirm('Delete Product', `Are you sure you want to delete "${name}"? This cannot be undone.`);
    if (!ok) return;
    try {
        await API.deleteProduct(id);
        toast('Product deleted', 'success');
        loadProducts();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (err) {
        toast(err.message, 'error');
    }
};

/* ══════════════════════════════════════════
   ORDERS
   ══════════════════════════════════════════ */
async function loadOrders(filters = {}) {
    const tbody = $('orders-tbody');
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Loading orders...</td></tr>`;
    try {
        const res = await API.getOrders(filters);
        $('orders-count-badge').textContent = res.count;
        renderOrders(res.data);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Error: ${escHtml(err.message)}</td></tr>`;
        toast('Failed to load orders', 'error');
    }
}

function renderOrders(orders) {
    const tbody = $('orders-tbody');
    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No orders found.</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
    <tr>
      <td class="font-mono">${escHtml(o.orderNumber)}</td>
      <td>
        <div class="product-name-cell">
          <span style="font-weight:600;color:var(--text-primary)">${escHtml(o.customerName)}</span>
          <span class="product-desc">${escHtml(o.customerEmail)}</span>
        </div>
      </td>
      <td style="color:var(--text-primary);font-weight:600">${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
      <td class="price-cell">${fmt(o.totalAmount)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td class="text-muted">${fmtDate(o.createdAt)}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn view" title="View Details" onclick="viewOrder('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          ${o.status !== 'cancelled' && o.status !== 'completed' ? `
          <button class="action-btn delete" title="Cancel Order" onclick="cancelOrderAction('${o.id}', '${escHtml(o.orderNumber)}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// Order filters
$('order-status-filter').addEventListener('change', () => {
    loadOrders({ status: $('order-status-filter').value, customerEmail: $('order-email-filter').value });
});
$('order-email-filter').addEventListener('input', debounce(() => {
    loadOrders({ status: $('order-status-filter').value, customerEmail: $('order-email-filter').value });
}, 400));
$('clear-order-filters').addEventListener('click', () => {
    $('order-status-filter').value = '';
    $('order-email-filter').value = '';
    loadOrders();
});

/* ── Create Order Modal ── */
let orderItemCount = 0;

function openOrderModal() {
    $('order-form').reset();
    orderItemCount = 0;
    $('order-items-list').innerHTML = '';
    $('order-total-preview').style.display = 'none';
    addOrderItemRow();
    $('order-modal-overlay').classList.add('open');
    setTimeout(() => $('order-customer-name').focus(), 100);
}
function closeOrderModal() {
    $('order-modal-overlay').classList.remove('open');
}

$('create-order-btn').addEventListener('click', openOrderModal);
$('order-modal-close').addEventListener('click', closeOrderModal);
$('order-cancel-btn').addEventListener('click', closeOrderModal);
$('order-modal-overlay').addEventListener('click', e => {
    if (e.target === $('order-modal-overlay')) closeOrderModal();
});

function addOrderItemRow() {
    orderItemCount++;
    const idx = orderItemCount;
    const div = document.createElement('div');
    div.className = 'order-item-row';
    div.id = `order-item-row-${idx}`;
    div.innerHTML = `
    <select class="form-select order-product-select" id="order-product-${idx}" onchange="updateOrderTotal()">
      <option value="">Select product…</option>
      ${allProducts.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">${escHtml(p.name)} — ${fmt(p.price)} (${p.stock} left)</option>`).join('')}
    </select>
    <input class="form-input" type="number" min="1" value="1" id="order-qty-${idx}" placeholder="Qty" oninput="updateOrderTotal()" />
    <button type="button" class="remove-item-btn" onclick="removeOrderItemRow(${idx})" title="Remove item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
    $('order-items-list').appendChild(div);
}

window.removeOrderItemRow = (idx) => {
    const row = $(`order-item-row-${idx}`);
    if (row) row.remove();
    updateOrderTotal();
};

window.updateOrderTotal = () => {
    let total = 0;
    let hasItem = false;
    document.querySelectorAll('[id^="order-item-row-"]').forEach(row => {
        const idx = row.id.replace('order-item-row-', '');
        const sel = $(`order-product-${idx}`);
        const qty = $(`order-qty-${idx}`);
        if (sel && qty && sel.value) {
            const price = parseFloat(sel.selectedOptions[0]?.dataset.price || 0);
            const q = parseInt(qty.value) || 1;
            total += price * q;
            hasItem = true;
        }
    });
    const preview = $('order-total-preview');
    if (hasItem) {
        preview.style.display = 'flex';
        $('order-total-amount').textContent = fmt(total);
    } else {
        preview.style.display = 'none';
    }
};

$('add-order-item-btn').addEventListener('click', () => {
    if (allProducts.length === 0) {
        toast('No products available to add', 'info');
        return;
    }
    addOrderItemRow();
});

$('order-form').addEventListener('submit', async e => {
    e.preventDefault();

    const customerName = $('order-customer-name').value.trim();
    const customerEmail = $('order-customer-email').value.trim();

    if (!customerName || !customerEmail) {
        toast('Customer name and email are required', 'error');
        return;
    }

    const items = [];
    document.querySelectorAll('[id^="order-item-row-"]').forEach(row => {
        const idx = row.id.replace('order-item-row-', '');
        const sel = $(`order-product-${idx}`);
        const qty = $(`order-qty-${idx}`);
        if (sel && sel.value && qty) {
            items.push({ productId: sel.value, quantity: parseInt(qty.value) || 1 });
        }
    });

    if (items.length === 0) {
        toast('Add at least one item to the order', 'error');
        return;
    }

    const submitBtn = $('order-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing…';

    try {
        await API.createOrder({ customerName, customerEmail, items });
        toast('Order placed successfully!', 'success');
        closeOrderModal();
        loadOrders();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
});

/* ── View order details ── */
window.viewOrder = async (id) => {
    try {
        const res = await API.getOrder(id);
        const o = res.data;

        $('order-detail-title').textContent = o.orderNumber;
        $('order-detail-content').innerHTML = `
      <div class="order-detail-body">
        <div class="order-meta-grid">
          <div class="order-meta-item">
            <span class="order-meta-label">Customer</span>
            <span class="order-meta-value">${escHtml(o.customerName)}</span>
          </div>
          <div class="order-meta-item">
            <span class="order-meta-label">Email</span>
            <span class="order-meta-value">${escHtml(o.customerEmail)}</span>
          </div>
          <div class="order-meta-item">
            <span class="order-meta-label">Status</span>
            <span class="order-meta-value"><span class="status-badge status-${o.status}">${o.status}</span></span>
          </div>
          <div class="order-meta-item">
            <span class="order-meta-label">Date</span>
            <span class="order-meta-value">${fmtDate(o.createdAt)}</span>
          </div>
        </div>

        <table class="order-items-table">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            ${o.items.map(item => `
              <tr>
                <td>${escHtml(item.productName)}</td>
                <td>${item.quantity}</td>
                <td>${fmt(item.price)}</td>
                <td style="font-weight:600;color:var(--text-primary)">${fmt(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="order-detail-total">Total: <span>${fmt(o.totalAmount)}</span></div>

        ${o.status !== 'cancelled' && o.status !== 'completed' ? `
        <div class="order-status-controls">
          <label>Update Status</label>
          <select class="form-select" id="order-new-status" style="max-width:180px">
            <option value="pending"    ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="completed"  ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.id}')">Update</button>
          <button class="btn btn-danger btn-sm" onclick="cancelOrderAction('${o.id}', '${escHtml(o.orderNumber)}')">Cancel Order</button>
        </div>
        ` : ''}
      </div>
    `;
        $('order-detail-overlay').classList.add('open');
    } catch (err) {
        toast('Failed to load order: ' + err.message, 'error');
    }
};

$('order-detail-close').addEventListener('click', () => {
    $('order-detail-overlay').classList.remove('open');
});
$('order-detail-overlay').addEventListener('click', e => {
    if (e.target === $('order-detail-overlay')) $('order-detail-overlay').classList.remove('open');
});

window.updateOrderStatus = async (id) => {
    const newStatus = $('order-new-status').value;
    try {
        await API.updateOrderStatus(id, newStatus);
        toast(`Order status updated to "${newStatus}"`, 'success');
        $('order-detail-overlay').classList.remove('open');
        loadOrders();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (err) {
        toast(err.message, 'error');
    }
};

window.cancelOrderAction = async (id, orderNum) => {
    const ok = await confirm('Cancel Order', `Are you sure you want to cancel order ${orderNum}?`);
    if (!ok) return;
    try {
        await API.cancelOrder(id);
        toast('Order cancelled', 'success');
        $('order-detail-overlay').classList.remove('open');
        loadOrders();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (err) {
        toast(err.message, 'error');
    }
};

/* ── Dismiss modals on escape ── */
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeProductModal();
    closeOrderModal();
    $('order-detail-overlay').classList.remove('open');
    $('confirm-overlay').classList.remove('open');
});

/* ── Utility ── */
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── Init ── */
(async function init() {
    // Load products into memory first (needed for order modal dropdowns)
    try {
        const res = await API.getProducts();
        allProducts = res.data;
        $('products-count-badge').textContent = res.count;
    } catch {/* silent */ }

    loadDashboard();
})();
