import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dev-secret-key',
    },
});

export const inventoryService = {
    getProducts: () => api.get('/products'),
    getProduct: (id) => api.get(`/products/${id}`),
    createProduct: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/products', formData, {
            headers: { 'Content-Type': null }
        });
    },
    patchProduct: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.patch(`/products/${id}`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    receiveStock: (id, { quantity, reference, file, is_return, parent_id }) => {
        const formData = new FormData();
        formData.append('quantity', quantity);
        formData.append('reference', reference);
        formData.append('is_return', is_return || false);
        if (parent_id) formData.append('parent_id', parent_id);
        if (file) formData.append('file', file);
        return api.post(`/products/${id}/receive-stock`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    sellProduct: (id, { quantity, reference, applicant, applicant_area, is_returnable, return_deadline, recipient_email, sales_order_id, file }) => {
        const formData = new FormData();
        formData.append('quantity', quantity);
        formData.append('reference', reference);
        formData.append('applicant', applicant);
        formData.append('applicant_area', applicant_area);
        formData.append('is_returnable', is_returnable);
        if (return_deadline) formData.append('return_deadline', return_deadline);
        if (recipient_email) formData.append('recipient_email', recipient_email);
        if (sales_order_id) formData.append('sales_order_id', sales_order_id);
        if (file) formData.append('file', file);

        return api.post(`/products/${id}/sell`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    getMovements: () => api.get('/products/movements'),
    getPendingReturns: (productId) => api.get('/products/pending-returns', { params: { product_id: productId } }),
};

export const purchasingService = {
    getSuppliers: () => api.get('/purchasing/suppliers'),
    createSupplier: (data) => api.post('/purchasing/suppliers', data),
    getOrders: () => api.get('/purchasing/orders'),
    createOrder: (data) => api.post('/purchasing/orders', data),
    updateOrder: (id, data) => {
        const formData = data instanceof FormData ? data : new FormData();
        if (!(data instanceof FormData)) {
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
        }
        return api.patch(`/purchasing/orders/${id}`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    getKPIs: () => api.get('/purchasing/kpis'),
    updateSupplier: (id, data) => api.patch(`/purchasing/suppliers/${id}`, data),
    deleteSupplier: (id) => api.delete(`/purchasing/suppliers/${id}`),
    deleteOrder: (id) => api.delete(`/purchasing/orders/${id}`),
    updateOrderDetails: (id, data) => api.patch(`/purchasing/orders/${id}/detail`, data),
};

export const salesService = {
    getOrders: () => api.get('/sales/orders'),
    getOrder: (id) => api.get(`/sales/orders/${id}`),
    createOrder: (data) => api.post('/sales/orders', data),
    updateOrder: (id, data) => api.patch(`/sales/orders/${id}`, data),
    deleteOrder: (id) => api.delete(`/sales/orders/${id}`),
    getKPIs: () => api.get('/sales/kpis'),
};

export const analyticsService = {
    getDashboard: (startDate, endDate, productId) => api.get('/analytics/dashboard', {
        params: { start_date: startDate, end_date: endDate, product_id: productId || undefined }
    }),
    getPriceVariation: (year, month, productId) => api.get('/analytics/price-variation', {
        params: { year, month, product_id: productId || undefined }
    }),
};

export default api;
