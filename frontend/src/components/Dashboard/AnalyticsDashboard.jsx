import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { analyticsService, inventoryService } from '../../services/api';
import { TrendingUp, DollarSign, Activity, Calendar, AlertCircle, Filter, Package } from 'lucide-react';

const COLORS = {
    purchases: '#ea4335',
    sales: '#1a73e8',
    margin: '#188038',
};

export const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');

    // Price variation chart
    const [priceData, setPriceData] = useState(null);
    const [priceLoading, setPriceLoading] = useState(false);

    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);

    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    const [dateRange, setDateRange] = useState({
        start: formatDateForInput(firstDay),
        end: formatDateForInput(currentDate)
    });

    // Fetch products list for filter dropdown
    useEffect(() => {
        inventoryService.getProducts()
            .then(res => setProducts(res.data || []))
            .catch(() => {});
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await analyticsService.getDashboard(dateRange.start, dateRange.end, selectedProduct);
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar datos analíticos.");
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedProduct]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch price variation data (uses global end date month + global product)
    const endDateObj = new Date(dateRange.end + 'T00:00:00');
    const globalMonth = endDateObj.getMonth() + 1;
    const globalYear = endDateObj.getFullYear();

    const fetchPriceVariation = useCallback(async () => {
        setPriceLoading(true);
        try {
            const res = await analyticsService.getPriceVariation(globalYear, globalMonth, selectedProduct);
            setPriceData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setPriceLoading(false);
        }
    }, [globalYear, globalMonth, selectedProduct]);

    useEffect(() => {
        fetchPriceVariation();
    }, [fetchPriceVariation]);

    // Click on a product bar to filter evolution chart
    const handleProductClick = (productData) => {
        if (productData && productData.product_id) {
            setSelectedProduct(prev =>
                prev === productData.product_id ? '' : productData.product_id
            );
        }
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a73e8] border-b-transparent"></div>
                <p className="text-sm text-[#5f6368]">Calculando métricas del negocio...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#fce8e6] border border-[#f5c2c7] text-[#d93025] p-6 rounded-2xl flex items-center space-x-4">
                <AlertCircle size={24} />
                <p className="font-medium">{error}</p>
                <button
                    onClick={fetchData}
                    className="ml-auto bg-white/50 hover:bg-white/70 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!data) return null;

    const formatCurrency = (val) => `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // Parse monthly_data
    const monthlyData = (data.monthly_data || []).map((d) => ({
        month: d.month,
        purchase_cost: parseFloat(d.purchase_cost) || 0,
        sales_revenue: parseFloat(d.sales_revenue) || 0,
    }));

    // Parse top_products
    const topProducts = (data.top_products || []).map((p) => ({
        ...p,
        total_cost: parseFloat(p.total_cost) || 0,
        total_sales: parseFloat(p.total_sales) || 0,
        margin: parseFloat(p.margin) || 0,
    }));

    // Parse unit_costs
    const unitCosts = (data.unit_costs || []).map((p) => ({
        ...p,
        avg_purchase_cost: parseFloat(p.avg_purchase_cost) || 0,
        avg_sale_price: parseFloat(p.avg_sale_price) || 0,
        unit_profit: parseFloat(p.unit_profit) || 0,
    }));

    const selectedProductName = selectedProduct
        ? (products.find(p => p.id === selectedProduct)?.name || 'Producto')
        : null;

    return (
        <div className="space-y-8 animate-fade-in p-2">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-[#202124]">Inteligencia de Negocio</h2>
                    <p className="text-sm text-[#5f6368] mt-1">Análisis financiero y rendimiento de productos</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Product filter */}
                    <div className="flex items-center bg-white p-2 rounded-xl border border-[#dadce0] shadow-sm">
                        <Filter size={18} className="text-[#5f6368] ml-2 mr-1" />
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="text-sm text-[#202124] border-none focus:ring-0 cursor-pointer bg-transparent pr-6"
                        >
                            <option value="">Todos los productos</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Date filter */}
                    <div className="flex items-center bg-white p-2 rounded-xl border border-[#dadce0] shadow-sm gap-1">
                        <Calendar size={18} className="text-[#5f6368] ml-2" />
                        <div className="flex flex-col">
                            <label className="text-[10px] text-[#5f6368] font-medium px-1">Inicio</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="text-sm text-[#202124] border-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <span className="text-[#5f6368] mt-3">-</span>
                        <div className="flex flex-col">
                            <label className="text-[10px] text-[#5f6368] font-medium px-1">Fin</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="text-sm text-[#202124] border-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active filter indicator */}
            {selectedProductName && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full font-medium">
                        Filtrando: {selectedProductName}
                    </span>
                    <button
                        onClick={() => setSelectedProduct('')}
                        className="text-[#5f6368] hover:text-[#202124] text-xs underline"
                    >
                        Limpiar filtro
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <KpiCard
                    title="Ingresos Totales"
                    value={formatCurrency(data.total_revenue)}
                    icon={DollarSign}
                    color="text-[#1a73e8]"
                    bg="bg-[#e8f0fe]"
                />
                <KpiCard
                    title="Costo Total"
                    value={formatCurrency(data.total_cost)}
                    icon={Activity}
                    color="text-[#ea4335]"
                    bg="bg-[#fce8e6]"
                />
                <KpiCard
                    title="Ganancia Bruta"
                    value={formatCurrency(data.gross_profit)}
                    icon={TrendingUp}
                    color="text-[#188038]"
                    bg="bg-[#e6f4ea]"
                />
                <KpiCard
                    title="Margen de Ganancia"
                    value={`${parseFloat(data.margin_percentage).toFixed(1)}%`}
                    icon={TrendingUp}
                    color={data.margin_percentage > 20 ? "text-[#188038]" : "text-[#f9ab00]"}
                    bg={data.margin_percentage > 20 ? "bg-[#e6f4ea]" : "bg-[#fef7e0]"}
                />
                <KpiCard
                    title="Stock Total"
                    value={`${(data.total_stock || 0).toLocaleString()} uds`}
                    icon={Package}
                    color="text-[#7c3aed]"
                    bg="bg-[#ede9fe]"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Monthly Evolution: Purchase Cost vs Sales Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm">
                    <h3 className="text-lg font-medium text-[#202124] mb-6">
                        Evolución de Ingresos y Ganancias
                    </h3>
                    <div className="h-[300px] w-full">
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                                    <XAxis dataKey="month" stroke="#9aa0a6" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9aa0a6" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(val, name) => [formatCurrency(val), name]}
                                    />
                                    <Legend />
                                    <Bar dataKey="purchase_cost" name="Costo de Compras" fill={COLORS.purchases} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="sales_revenue" name="Ingresos de Ventas" fill={COLORS.sales} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[#5f6368] text-sm">
                                Sin datos en el rango seleccionado.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top 5 Products: Cost, Sales, Margin */}
                <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm">
                    <h3 className="text-lg font-medium text-[#202124] mb-6">Productos Más Rentables (Top 5)</h3>
                    <div className="h-[300px] w-full">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topProducts}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
                                    <XAxis
                                        type="number"
                                        stroke="#9aa0a6"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="product_name"
                                        stroke="#5f6368"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        width={120}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f3f4' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(val, name) => {
                                            if (name === 'Margen') return [`${val.toFixed(1)}%`, name];
                                            return [formatCurrency(val), name];
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="total_cost"
                                        name="Costo Total"
                                        fill={COLORS.purchases}
                                        radius={[0, 4, 4, 0]}
                                        barSize={14}
                                        onClick={(data) => handleProductClick(data)}
                                        cursor="pointer"
                                    />
                                    <Bar
                                        dataKey="total_sales"
                                        name="Ventas"
                                        fill={COLORS.sales}
                                        radius={[0, 4, 4, 0]}
                                        barSize={14}
                                        onClick={(data) => handleProductClick(data)}
                                        cursor="pointer"
                                    />
                                    <Bar
                                        dataKey="margin"
                                        name="Margen"
                                        fill={COLORS.margin}
                                        radius={[0, 4, 4, 0]}
                                        barSize={14}
                                        onClick={(data) => handleProductClick(data)}
                                        cursor="pointer"
                                    >
                                        {topProducts.map((entry, index) => (
                                            <Cell
                                                key={`cell-margin-${index}`}
                                                fill={entry.margin >= 0 ? COLORS.margin : '#f9ab00'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[#5f6368] text-sm">
                                Sin datos de productos en el rango seleccionado.
                            </div>
                        )}
                    </div>
                    {topProducts.length > 0 && (
                        <p className="text-xs text-[#9aa0a6] mt-3 text-center">
                            Haz click en un producto para filtrar la evolución mensual
                        </p>
                    )}
                </div>
            </div>

            {/* Unit Cost vs Sale Price per Product */}
            <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm">
                <h3 className="text-lg font-medium text-[#202124] mb-2">Costo de Compra vs Precio de Venta Unitario</h3>
                <p className="text-sm text-[#5f6368] mb-6">Ganancia por unidad vendida de cada producto</p>
                <div className="h-[350px] w-full">
                    {unitCosts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={unitCosts}
                                layout="vertical"
                                margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
                                <XAxis
                                    type="number"
                                    stroke="#9aa0a6"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="product_name"
                                    stroke="#5f6368"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f3f4' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val, name) => [formatCurrency(val), name]}
                                />
                                <Legend />
                                <Bar
                                    dataKey="avg_purchase_cost"
                                    name="Costo Compra Unit."
                                    fill={COLORS.purchases}
                                    radius={[0, 4, 4, 0]}
                                    barSize={16}
                                />
                                <Bar
                                    dataKey="avg_sale_price"
                                    name="Precio Venta Unit."
                                    fill={COLORS.sales}
                                    radius={[0, 4, 4, 0]}
                                    barSize={16}
                                />
                                <Bar
                                    dataKey="unit_profit"
                                    name="Ganancia Unit."
                                    fill={COLORS.margin}
                                    radius={[0, 4, 4, 0]}
                                    barSize={16}
                                >
                                    {unitCosts.map((entry, index) => (
                                        <Cell
                                            key={`cell-unit-${index}`}
                                            fill={entry.unit_profit >= 0 ? COLORS.margin : '#f9ab00'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#5f6368] text-sm">
                            Sin datos de costos unitarios en el rango seleccionado.
                        </div>
                    )}
                </div>
            </div>

            {/* Price Variation Over Time */}
            <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm">
                <h3 className="text-lg font-medium text-[#202124] mb-1">Variación de Precios en el Tiempo</h3>
                <p className="text-sm text-[#5f6368] mb-6">
                    Precio unitario de compra vs venta día a día
                    {priceData?.product_name && <span className="font-medium text-[#1a73e8]"> — {priceData.product_name}</span>}
                    {priceData?.month_label && <span className="text-[#5f6368]"> ({priceData.month_label})</span>}
                </p>
                <div className="h-[300px] w-full">
                    {priceLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a73e8] border-b-transparent"></div>
                        </div>
                    ) : (priceData?.data || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={(priceData.data || []).map(d => ({
                                    day: `${d.day}`,
                                    avg_purchase_price: parseFloat(d.avg_purchase_price) || 0,
                                    avg_sale_price: parseFloat(d.avg_sale_price) || 0,
                                }))}
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#9aa0a6"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: priceData.month_label, position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9aa0a6' }}
                                />
                                <YAxis
                                    stroke="#9aa0a6"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val, name) => [formatCurrency(val), name]}
                                    labelFormatter={(label) => `Día ${label}`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="avg_purchase_price"
                                    name="Precio Compra"
                                    stroke={COLORS.purchases}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: COLORS.purchases }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avg_sale_price"
                                    name="Precio Venta"
                                    stroke={COLORS.sales}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: COLORS.sales }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#5f6368] text-sm">
                            Sin transacciones en {priceData?.month_label || 'el mes seleccionado'}.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl border border-[#dadce0] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-[#5f6368]">{title}</p>
                <h3 className="text-2xl font-bold text-[#202124] mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);
