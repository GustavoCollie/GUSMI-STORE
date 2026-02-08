import React, { useState } from 'react';
import {
    ShoppingCart,
    TrendingUp,
    Clock,
    CheckCircle,
    Plus,
    DollarSign,
    Users,
    Package,
    AlertTriangle,
    Truck,
    CreditCard,
    Search,
    FileSpreadsheet,
    Printer,
    Pencil,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export const SalesDashboard = ({
    orders,
    kpis,
    loading,
    onAddOrder,
    onEditOrder,
    onDeleteOrder,
    error
}) => {
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [productSearch, setProductSearch] = useState('');

    if (loading && !kpis && !error) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a73e8] border-b-transparent"></div>
                <p className="text-sm text-[#5f6368] animate-pulse">Cargando panel de ventas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#fce8e6] border border-[#f5c2c7] text-[#d93025] p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
                <AlertTriangle size={48} className="text-[#d93025]" />
                <div>
                    <h2 className="text-lg font-bold">Error en el Módulo de Ventas</h2>
                    <p className="text-sm opacity-90">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#d93025] text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-[#b9281e] transition-all"
                >
                    Reintentar Conexión
                </button>
            </div>
        );
    }

    const handleExportExcel = () => {
        const title = "Reporte de Ventas";
        const description = "Detalle de órdenes de venta generadas";

        const headers = [
            'Referencia',
            'Fecha Creación',
            'Cliente',
            'Email Cliente',
            'Producto',
            'Cantidad',
            'Total (c/IGV)',
            'Costo Envío',
            'IGV',
            'Tipo Envío',
            'Fecha Entrega',
            'Estado'
        ];

        const dataRows = orders.map(order => [
            `OV-${order.id.substring(0, 6)}`,
            new Date(order.created_at).toLocaleDateString('es-CL'),
            order.customer_name,
            order.customer_email,
            order.product_name,
            order.quantity,
            parseFloat(order.total_amount),
            parseFloat(order.shipping_cost || 0),
            parseFloat(order.tax_amount),
            order.shipping_type,
            order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-CL') : '—',
            order.status
        ]);

        const wsData = [
            [title],
            [description],
            [],
            headers,
            ...dataRows
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Merge cells
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });

        // Column widths
        const wscols = headers.map(() => ({ wch: 20 }));
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");

        const filename = `Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const generateTicketPDF = (order) => {
        // 80mm width thermal printer size
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200] // Width 80mm, variable height (approx)
        });

        // Config variables
        const centerX = 40;
        let yPos = 10;
        const margin = 5;
        const colWidth = 70;

        // Fonts
        doc.setFont("courier", "bold");
        doc.setFontSize(12);

        // Header
        doc.text("GUSMI INVENTARIO", centerX, yPos, { align: "center" });
        yPos += 5;
        doc.setFontSize(10);
        doc.text("TICKET DE VENTA", centerX, yPos, { align: "center" });
        yPos += 5;

        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.text(`${new Date(order.created_at).toLocaleString('es-CL')}`, centerX, yPos, { align: "center" });
        yPos += 8;

        doc.text("--------------------------------", centerX, yPos, { align: "center" });
        yPos += 5;

        // Order Info
        doc.text(`ORDEN: OV-${order.id.substring(0, 6)}`, margin, yPos);
        yPos += 5;
        doc.text(`CLIENTE: ${order.customer_name}`, margin, yPos);
        yPos += 5;
        doc.text(`EMAIL: ${order.customer_email}`, margin, yPos);
        yPos += 8;

        doc.text("--------------------------------", centerX, yPos, { align: "center" });
        yPos += 5;

        // Item Logic
        // Product
        doc.setFont("courier", "bold");
        doc.text("PRODUCTO", margin, yPos);
        yPos += 5;
        doc.setFont("courier", "normal");
        // Simple text wrapping if needed, but keeping it simple for now
        const splitText = doc.splitTextToSize(order.product_name, colWidth);
        doc.text(splitText, margin, yPos);
        yPos += (splitText.length * 4);

        doc.text(`CANTIDAD: ${order.quantity}`, margin, yPos);
        yPos += 5;

        doc.text("--------------------------------", centerX, yPos, { align: "center" });
        yPos += 5;

        // Money
        const rightAlign = 75;

        const addLine = (label, value) => {
            doc.text(label, margin, yPos);
            doc.text(value, rightAlign, yPos, { align: "right" });
            yPos += 5;
        };

        const formatCurrency = (val) => `$${parseFloat(val).toLocaleString()}`;

        addLine("SUBTOTAL:", formatCurrency(order.subtotal || (order.total_amount - order.tax_amount)));
        if (parseFloat(order.shipping_cost) > 0) {
            addLine("ENVIO:", formatCurrency(order.shipping_cost));
        }
        addLine("IGV (18%):", formatCurrency(order.tax_amount));

        yPos += 2;
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        addLine("TOTAL:", formatCurrency(order.total_amount));

        yPos += 8;
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.text("Gracias por su compra!", centerX, yPos, { align: "center" });
        yPos += 5;
        doc.text("www.gusmi-store.com", centerX, yPos, { align: "center" });

        // Auto print (optional, just save for now)
        doc.save(`Ticket_OV-${order.id.substring(0, 6)}.pdf`);
    };

    const kpiCards = [
        {
            title: "Ventas Totales",
            value: `${kpis?.total_sales_count || 0}`,
            icon: ShoppingCart,
            color: "text-[#1a73e8]",
            bg: "bg-[#e8f0fe]",
            description: "Órdenes de venta procesadas"
        },
        {
            title: "Ingresos Brutos",
            value: `$${parseFloat(kpis?.total_revenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-[#1e8e3e]",
            bg: "bg-[#e6f4ea]",
            description: "Total recaudado (incl. IGV)"
        },
        {
            title: "Despachos Pendientes",
            value: `${kpis?.pending_deliveries || 0}`,
            icon: Truck,
            color: "text-[#f9ab00]",
            bg: "bg-[#fef7e0]",
            description: "Órdenes listas para salida"
        },
        {
            title: "Crecimiento",
            value: "+12.5%",
            icon: TrendingUp,
            color: "text-[#b06000]",
            bg: "bg-[#fef7e0]",
            description: "Vs. mes anterior"
        }
    ];

    const filteredOrders = orders
        .filter(order => {
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            const matchesProduct = order.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                `OV-${order.id.substring(0, 6)}`.toLowerCase().includes(productSearch.toLowerCase());
            return matchesStatus && matchesProduct;
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Build FIFO queue positions for PENDING orders
    const pendingQueue = filteredOrders
        .filter(o => o.status === 'PENDING')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const queuePositionMap = {};
    pendingQueue.forEach((o, idx) => { queuePositionMap[o.id] = idx + 1; });

    const getAttentionOrders = () => {
        const now = new Date();
        return orders.filter(order => {
            if (order.status !== 'PENDING') return false;
            const createdDate = new Date(order.created_at);
            const diffHours = (now - createdDate) / (1000 * 60 * 60);
            return diffHours > 24;
        });
    };

    const attentionOrders = getAttentionOrders();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="google-card p-6 !rounded-2xl border-[#e8eaed]">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className={`${card.bg} ${card.color} p-2.5 rounded-full`}>
                                <card.icon size={20} />
                            </div>
                            <h3 className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">{card.title}</h3>
                        </div>
                        <p className={`text-3xl font-medium text-[#202124] tracking-tight`}>{card.value}</p>
                        <p className="text-[11px] text-[#5f6368] mt-2 font-medium">{card.description}</p>
                    </div>
                ))}
            </div>

            {/* Actions & Filters Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={onAddOrder}
                    className="flex items-center space-x-2 bg-[#1a73e8] text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-sm shrink-0"
                >
                    <Plus size={18} />
                    <span>Nueva Orden de Venta</span>
                </button>

                <div className="flex flex-1 items-center space-x-3 max-w-2xl">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por producto o referencia..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="COMPLETED">Completadas</option>
                        <option value="CANCELLED">Canceladas</option>
                    </select>
                </div>
            </div>

            {attentionOrders.length > 0 && (
                <div className="bg-[#fce8e6] border border-[#f5c2c7] px-6 py-4 rounded-2xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3 text-[#d93025]">
                        <AlertTriangle size={20} />
                        <div>
                            <p className="text-sm font-bold">Atención Requerida</p>
                            <p className="text-xs opacity-90">Hay {attentionOrders.length} pedidos pendientes con más de 24 horas sin atender.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setStatusFilter('PENDING');
                            setProductSearch('');
                        }}
                        className="text-xs font-bold uppercase tracking-wider text-[#d93025] hover:underline"
                    >
                        Ver Pedidos Críticos
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-medium text-[#202124]">Órdenes de Venta</h2>
                        <p className="text-xs text-[#5f6368] mt-0.5">Gestión de salida y facturación a clientes</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-[#e6f4ea] text-[#1e8e3e] rounded-lg hover:bg-[#ceead6] transition-colors text-xs font-medium border border-[#1e8e3e]/20"
                        >
                            <FileSpreadsheet size={16} />
                            <span>Exportar Excel</span>
                        </button>
                        <span className="bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {filteredOrders.length} FILTRADOS / {orders.length} TOTAL
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="google-table">
                        <thead>
                            <tr>
                                <th>Cola</th>
                                <th>Referencia</th>
                                <th>Cliente</th>
                                <th>Producto</th>
                                <th>Total (c/IGV)</th>
                                <th>Envío</th>
                                <th>Estado</th>
                                <th className="text-right">Ticket</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => {
                                const isCritical = attentionOrders.some(ao => ao.id === order.id);
                                const queuePos = queuePositionMap[order.id];
                                const isNextToDispatch = queuePos === 1;
                                return (
                                    <tr key={order.id} className={`hover:bg-[#f8f9fa] transition-colors ${isNextToDispatch ? 'bg-[#e8f0fe] border-l-4 border-l-[#1a73e8]' : ''} ${isCritical ? 'bg-red-50/10' : ''}`}>
                                        <td>
                                            {queuePos ? (
                                                <div className="flex flex-col items-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isNextToDispatch ? 'bg-[#1a73e8] text-white' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                                                        {queuePos}
                                                    </span>
                                                    {isNextToDispatch && (
                                                        <span className="text-[9px] font-bold text-[#1a73e8] mt-0.5 uppercase">Próximo</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-[#5f6368]">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-[#202124]">OV-{order.id.substring(0, 6)}</span>
                                                    {isCritical && (
                                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Pedido Crítico (>24h)" />
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-[#5f6368]">
                                                    {new Date(order.created_at).toLocaleDateString('es-CL')}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#202124]">{order.customer_name}</span>
                                                <span className="text-[11px] text-[#5f6368]">{order.customer_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#202124]">{order.product_name}</span>
                                                <span className="text-[11px] text-[#5f6368] font-medium">CANT: {order.quantity}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[#202124]">${parseFloat(order.total_amount).toLocaleString()}</span>
                                                <span className="text-[10px] text-[#5f6368]">IGV: ${parseFloat(order.tax_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#202124]">{order.shipping_type}</span>
                                                {order.delivery_date && (
                                                    <span className="text-[11px] text-[#5f6368]">
                                                        {new Date(order.delivery_date).toLocaleDateString('es-CL')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="text-right flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onEditOrder(order)}
                                                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-all"
                                                title="Editar Orden"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteOrder(order.id)}
                                                className="p-2 text-[#5f6368] hover:bg-[#ffebee] hover:text-[#d93025] rounded-full transition-all"
                                                title="Eliminar Orden"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => generateTicketPDF(order)}
                                                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-all"
                                                title="Imprimir Ticket"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#dadce0] mx-4">
                    <ShoppingCart size={48} className="mx-auto text-[#dadce0] mb-4" />
                    <p className="text-[#5f6368] font-medium">No se han registrado órdenes de venta aún.</p>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: "bg-[#fff4e5] text-[#e37400] border-[#fee0b2]",
        COMPLETED: "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]",
        CANCELLED: "bg-[#fce8e6] text-[#d93025] border-[#f5c2c7]",
    };

    const labels = {
        PENDING: "Pendiente",
        COMPLETED: "Completada",
        CANCELLED: "Cancelada",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};
