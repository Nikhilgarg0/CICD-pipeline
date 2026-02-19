/* ══════════════════════════════════════════
   api.js — RetailOps API Client
   ══════════════════════════════════════════ */

const API = (() => {
    const BASE = '/api';

    async function request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body !== undefined) opts.body = JSON.stringify(body);

        const res = await fetch(BASE + path, opts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data.error || data.message || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return data;
    }

    return {
        /* ── Products ── */
        getProducts(filters = {}) {
            const params = new URLSearchParams();
            if (filters.category) params.set('category', filters.category);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            const qs = params.toString() ? `?${params}` : '';
            return request('GET', `/products${qs}`);
        },
        getProduct(id) { return request('GET', `/products/${id}`); },
        createProduct(data) { return request('POST', '/products', data); },
        updateProduct(id, data) { return request('PUT', `/products/${id}`, data); },
        deleteProduct(id) { return request('DELETE', `/products/${id}`); },

        /* ── Orders ── */
        getOrders(filters = {}) {
            const params = new URLSearchParams();
            if (filters.status) params.set('status', filters.status);
            if (filters.customerEmail) params.set('customerEmail', filters.customerEmail);
            const qs = params.toString() ? `?${params}` : '';
            return request('GET', `/orders${qs}`);
        },
        getOrder(id) { return request('GET', `/orders/${id}`); },
        createOrder(data) { return request('POST', '/orders', data); },
        updateOrderStatus(id, status) {
            return request('PATCH', `/orders/${id}/status`, { status });
        },
        cancelOrder(id) { return request('POST', `/orders/${id}/cancel`); },
        getOrderStats() { return request('GET', '/orders/stats'); },

        /* ── Health ── */
        health() { return fetch('/health').then(r => r.json()); },
    };
})();
