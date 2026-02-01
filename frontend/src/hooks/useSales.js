import { useState, useEffect, useCallback } from 'react';
import { salesService } from '../services/api';

export const useSales = () => {
    const [orders, setOrders] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, kpisRes] = await Promise.all([
                salesService.getOrders(),
                salesService.getKPIs()
            ]);
            setOrders(ordersRes.data);
            setKpis(kpisRes.data);
        } catch (err) {
            console.error("Error fetching sales data:", err);
            setError(err.response?.data?.detail || "Error al conectar con el servidor de ventas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createOrder = async (orderData) => {
        setLoading(true);
        try {
            const res = await salesService.createOrder(orderData);
            await fetchData();
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Error al crear la orden de venta");
        } finally {
            setLoading(false);
        }
    };

    const updateOrder = async (id, data) => {
        setLoading(true);
        try {
            const res = await salesService.updateOrder(id, data);
            await fetchData();
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Error al actualizar la orden de venta");
        } finally {
            setLoading(false);
        }
    };

    const deleteOrder = async (id) => {
        setLoading(true);
        try {
            await salesService.deleteOrder(id);
            await fetchData();
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Error al eliminar la orden de venta");
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        kpis,
        loading,
        error,
        createOrder,
        updateOrder,
        deleteOrder,
        refresh: fetchData
    };
};
