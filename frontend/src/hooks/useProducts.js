import { useState, useEffect } from 'react';
import { inventoryService } from '../services/api';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getProducts();
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar productos. Asegúrate de que el backend esté corriendo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async () => {
        try {
            setMovementsLoading(true);
            const response = await inventoryService.getMovements();
            setMovements(response.data);
        } catch (err) {
            console.error('Error fetching movements:', err);
        } finally {
            setMovementsLoading(false);
        }
    };

    const createProduct = async (productData) => {
        try {
            const response = await inventoryService.createProduct(productData);
            setProducts(prev => [response.data, ...prev]);
            fetchMovements(); // Add this line
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || 'Error al crear producto';
            throw new Error(message);
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await inventoryService.patchProduct(id, productData);
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || 'Error al actualizar producto';
            throw new Error(message);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await inventoryService.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            const message = err.response?.data?.detail || 'Error al eliminar producto';
            throw new Error(message);
        }
    };

    const updateStock = async (id, data, type) => {
        try {
            setLoading(true);
            let response;
            if (type === 'receive') {
                response = await inventoryService.receiveStock(id, data);
            } else if (type === 'return') {
                response = await inventoryService.receiveStock(id, { ...data, is_return: true });
            } else {
                response = await inventoryService.sellProduct(id, data);
            }
            setProducts(prev => prev.map(p => p.id === id ? response.data : p));
            fetchMovements(); // Refresh movements after update
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || 'Error al actualizar stock';
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchMovements();
    }, []);

    return {
        products,
        movements,
        loading,
        movementsLoading,
        error,
        refresh: () => { fetchProducts(); fetchMovements(); },
        createProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        fetchMovements
    };
};
