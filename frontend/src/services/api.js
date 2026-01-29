import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
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
    receiveStock: (id, { quantity, reference, file }) => {
        const formData = new FormData();
        formData.append('quantity', quantity);
        formData.append('reference', reference);
        if (file) formData.append('file', file);
        return api.post(`/products/${id}/receive-stock`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    sellProduct: (id, { quantity, reference, applicant, applicant_area, is_returnable, return_deadline, recipient_email, file }) => {
        const formData = new FormData();
        formData.append('quantity', quantity);
        formData.append('reference', reference);
        formData.append('applicant', applicant);
        formData.append('applicant_area', applicant_area);
        formData.append('is_returnable', is_returnable);
        if (return_deadline) formData.append('return_deadline', return_deadline);
        if (recipient_email) formData.append('recipient_email', recipient_email);
        if (file) formData.append('file', file);

        return api.post(`/products/${id}/sell`, formData, {
            headers: { 'Content-Type': null }
        });
    },
    getMovements: () => api.get('/products/movements'),
};

export default api;
