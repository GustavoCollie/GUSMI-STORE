import React, { useState } from 'react';
import {
    Users,
    ShoppingCart,
    TrendingDown,
    Clock,
    AlertTriangle,
    Plus,
    CheckCircle,
    XCircle,
    Truck,
    DollarSign,
    FileText,
    TrendingUp,
    Package,
    FileSpreadsheet,
    Edit,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ReceiveOrderModal } from './ReceiveOrderModal';

export const PurchasingDashboard = ({
    suppliers,
    orders,
    kpis,
    loading,
    onAddOrder,
    onAddSupplier,
    onAddProduct,
    onUpdateOrderStatus,
    onEditOrder,
    onDeleteOrder,
    error,
    showActions = true
}) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReceiveModal, setShowReceiveModal] = useState(false);

    if (loading && !kpis && !error) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a73e8] border-b-transparent"></div>
                <p className="text-sm text-[#5f6368] animate-pulse">Cargando panel de compras...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#fce8e6] border border-[#f5c2c7] text-[#d93025] p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
                <AlertTriangle size={48} className="text-[#d93025]" />
                <div>
                    <h2 className="text-lg font-bold">Error en el Módulo de Compras</h2>
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
        const title = "Reporte de Compras";
        const description = "Historial completo y seguimiento de suministros";

        const headers = [
            'Referencia',
            'Fecha',
            'Proveedor',
            'Producto',
            'Cantidad',
            'Precio Unitario',
            'Subtotal',
            'Flete',
            'Otros Gastos',
            'IGV',
            'Total Inversión',
            'Ahorro Negociado',
            'Estado'
        ];

        const dataRows = orders.map(order => [
            `OC-${order.id.substring(0, 6)}`,
            new Date(order.created_at).toLocaleDateString('es-CL'),
            order.supplier_name || 'Proveedor',
            order.product_name || 'Producto',
            order.quantity,
            parseFloat(order.unit_price || 0),
            (parseFloat(order.unit_price || 0) * order.quantity),
            parseFloat(order.freight_amount || 0),
            parseFloat(order.other_expenses_amount || 0),
            parseFloat(order.tax_amount || 0),
            parseFloat(order.total_amount),
            parseFloat(order.savings_amount || 0),
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
        XLSX.utils.book_append_sheet(wb, ws, "Compras");

        const filename = `Reporte_Compras_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const kpiCards = [
        {
            title: "Calidad de Entregas",
            value: `${(100 - (kpis?.quality_rate || 0)).toFixed(1)}%`,
            icon: CheckCircle,
            color: (kpis?.quality_rate || 0) > 10 ? "text-[#d93025]" : "text-[#1e8e3e]",
            bg: (kpis?.quality_rate || 0) > 10 ? "bg-[#fce8e6]" : "bg-[#e6f4ea]",
            description: "Productos aceptados sin defectos"
        },
        {
            title: "Valor Adquirido",
            value: `$${parseFloat(kpis?.total_cta || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-[#1a73e8]",
            bg: "bg-[#e8f0fe]",
            description: "Inversión total en compras"
        },
        {
            title: "Ahorro Negociado",
            value: `$${parseFloat(kpis?.total_savings || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-[#b06000]",
            bg: "bg-[#fef7e0]",
            description: "Diferencia vs precios base"
        },
        {
            title: "Eficiencia Logística",
            value: `${(kpis?.on_time_delivery_rate || 0).toFixed(1)}%`,
            icon: Clock,
            color: (kpis?.on_time_delivery_rate || 0) < 90 ? "text-[#e37400]" : "text-[#1e8e3e]",
            bg: (kpis?.on_time_delivery_rate || 0) < 90 ? "bg-[#fff4e5]" : "bg-[#e6f4ea]",
            description: "Órdenes entregadas a tiempo"
        }
    ];

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

            {/* Actions Section */}
            {showActions && (
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onAddOrder}
                        className="flex items-center space-x-2 bg-[#1a73e8] text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Nueva Orden de Compra</span>
                    </button>
                    <button
                        onClick={onAddProduct}
                        className="flex items-center space-x-2 bg-white text-[#1a73e8] border border-[#1a73e8] px-6 py-3 rounded-full font-medium text-sm hover:bg-[#e8f0fe] transition-all shadow-sm"
                    >
                        <Package size={18} />
                        <span>Registrar Nuevo Artículo</span>
                    </button>
                    <button
                        onClick={onAddSupplier}
                        className="flex items-center space-x-2 bg-white text-[#5f6368] border border-[#dadce0] px-6 py-3 rounded-full font-medium text-sm hover:bg-[#f8f9fa] transition-all"
                    >
                        <Users size={18} />
                        <span>Gestionar Proveedores</span>
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-medium text-[#202124]">Órdenes de Compra</h2>
                        <p className="text-xs text-[#5f6368] mt-0.5">Historial completo y seguimiento de suministros</p>
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
                            {orders.length} TOTAL
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="google-table">
                        <thead>
                            <tr>
                                <th>Referencia</th>
                                <th>Proveedor</th>
                                <th>Detalle</th>
                                <th>Inversión</th>
                                <th>Estado</th>
                                <th className="text-right">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors">
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#202124]">OC-{order.id.substring(0, 6)}</span>
                                            <span className="text-[11px] text-[#5f6368]">
                                                {new Date(order.created_at).toLocaleDateString('es-CL')}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[#5f6368]">
                                                <Users size={14} />
                                            </div>
                                            <span className="text-sm text-[#202124]">{order.supplier_name || 'Proveedor'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#202124]">{order.product_name || 'Producto'}</span>
                                            <span className="text-[11px] text-[#5f6368] font-medium">CANT: {order.quantity}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#202124]">${parseFloat(order.total_amount).toLocaleString()}</span>
                                            {parseFloat(order.savings_amount) > 0 && (
                                                <span className="text-[10px] text-[#1e8e3e] font-bold">-{order.savings_amount} ahorro</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end space-x-2">
                                            {order.status === 'PENDING' || order.status === 'ARRIVED' ? (
                                                <>
                                                    {order.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => onUpdateOrderStatus(order.id, 'ARRIVED')}
                                                            className="p-2 text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full transition-all"
                                                            title="Confirmar Llegada"
                                                        >
                                                            <Truck size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowReceiveModal(true);
                                                        }}
                                                        className="p-2 text-[#1e8e3e] hover:bg-[#e6f4ea] rounded-full transition-all"
                                                        title="Recibir Pedido (Ingresar a Almacén)"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateOrderStatus(order.id, 'REJECTED')}
                                                        className="p-2 text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-all"
                                                        title="Rechazar Pedido"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                    {order.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => onEditOrder(order)}
                                                                className="p-2 text-[#5f6368] hover:bg-[#f8f9fa] rounded-full transition-all"
                                                                title="Editar Orden"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteOrder(order.id)}
                                                                className="p-2 text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-all"
                                                                title="Eliminar Orden"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[#dadce0] uppercase tracking-widest mr-2">Cerrado</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#dadce0] mx-4">
                    <ShoppingCart size={48} className="mx-auto text-[#dadce0] mb-4" />
                    <p className="text-[#5f6368] font-medium">No se han registrado órdenes de compra aún.</p>
                </div>
            )}

            <ReceiveOrderModal
                isOpen={showReceiveModal}
                order={selectedOrder}
                onClose={() => {
                    setShowReceiveModal(false);
                    setSelectedOrder(null);
                }}
                onConfirm={onUpdateOrderStatus}
                loading={loading}
            />
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: "bg-[#fff4e5] text-[#e37400] border-[#fee0b2]",
        ARRIVED: "bg-[#e8f0fe] text-[#1a73e8] border-[#c2d7fa]",
        RECEIVED: "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]",
        REJECTED: "bg-[#fce8e6] text-[#d93025] border-[#f5c2c7]",
    };

    const labels = {
        PENDING: "Pendiente",
        ARRIVED: "Arribado",
        RECEIVED: "Recibido",
        REJECTED: "Rechazado",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};
