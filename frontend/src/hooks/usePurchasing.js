import { useState, useEffect } from 'react';
import { purchasingService } from '../services/api';

export const usePurchasing = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            console.log("Fetching purchasing data...");
            setLoading(true);
            const [suppliersRes, ordersRes, kpisRes] = await Promise.all([
                purchasingService.getSuppliers(),
                purchasingService.getOrders(),
                purchasingService.getKPIs()
            ]);
            console.log("Purchasing data fetched successfully:", {
                suppliers: suppliersRes.data.length,
                orders: ordersRes.data.length,
                kpis: kpisRes.data
            });
            setSuppliers(suppliersRes.data);
            setOrders(ordersRes.data);
            setKpis(kpisRes.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching purchasing data:", err);
            setError('Error al cargar datos de compras. Verifique la conexión con el servidor.');
        } finally {
            setLoading(false);
            console.log("Purchasing loading finished.");
        }
    };

    const createSupplier = async (data) => {
        const res = await purchasingService.createSupplier(data);
        setSuppliers(prev => [...prev, res.data]);
        return res.data;
    };

    const updateSupplier = async (id, data) => {
        const res = await purchasingService.updateSupplier(id, data);
        setSuppliers(prev => prev.map(s => s.id === id ? res.data : s));
        fetchData(); // Refresh to propagate name changes to orders
        return res.data;
    };

    const deleteSupplier = async (id) => {
        await purchasingService.deleteSupplier(id);
        setSuppliers(prev => prev.filter(s => s.id !== id));
        fetchData(); // Refresh to catch any side effects like KPI updates
    };

    const createOrder = async (data) => {
        const res = await purchasingService.createOrder(data);
        setOrders(prev => [res.data, ...prev]);
        fetchData(); // Refresh KPIs
        return res.data;
    };

    const updateOrder = async (id, data) => {
        const res = await purchasingService.updateOrder(id, data);
        setOrders(prev => prev.map(o => o.id === id ? res.data : o));
        fetchData(); // Refresh KPIs
        return res.data;
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        suppliers,
        orders,
        kpis,
        loading,
        error,
        refresh: fetchData,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        createOrder,
        updateOrder
    };
};
