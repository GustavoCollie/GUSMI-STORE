import React from 'react';
import { Plus, Trash2, Edit, ShoppingCart, Box, AlertTriangle, MoreVertical, Package, Clock, Lock, CalendarCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProductTable = ({ products, purchaseOrders = [], onReturn, onEdit, onDelete, onSell, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a73e8] border-b-transparent"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-2xl border border-[#dadce0] animate-fade-in mx-4">
                <Box className="mx-auto h-16 w-16 text-[#dadce0] mb-6" />
                <h3 className="text-xl font-medium text-[#202124]">No hay productos registrados</h3>
                <p className="text-[#5f6368] max-w-xs mx-auto mt-2">Agrega productos al catálogo para empezar a gestionar el inventario.</p>
            </div>
        );
    }

    // Build a map: product_id -> latest RECEIVED purchase order's actual_delivery_date
    const arrivalDateMap = {};
    purchaseOrders
        .filter(o => o.status === 'RECEIVED' && o.actual_delivery_date)
        .sort((a, b) => new Date(b.actual_delivery_date) - new Date(a.actual_delivery_date))
        .forEach(o => {
            if (!arrivalDateMap[o.product_id]) {
                arrivalDateMap[o.product_id] = o.actual_delivery_date;
            }
        });

    return (
        <div className="overflow-x-auto bg-white">
            <table className="google-table">
                <thead>
                    <tr>
                        <th>Producto / Descripción</th>
                        <th>SKU</th>
                        <th>Estado de Existencias</th>
                        <th>Fecha Llegada</th>
                        <th className="text-right">Acciones de Almacén</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const isLowStock = product.stock > 0 && product.stock <= 5;
                        const isOutOfStock = product.stock === 0;
                        const isPreorder = product.is_preorder;
                        const now = new Date();
                        const arrivalDate = isPreorder
                            ? (product.estimated_delivery_date ? new Date(product.estimated_delivery_date) : null)
                            : (arrivalDateMap[product.id] ? new Date(arrivalDateMap[product.id]) : null);
                        const isPreorderBlocked = isPreorder && (!arrivalDate || arrivalDate > now);

                        return (
                            <tr key={product.id} className={cn("hover:bg-[#f8f9fa] transition-colors", isPreorder && "bg-[#f3e8ff]/30")}>
                                <td className="font-['Outfit']">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isPreorder ? "bg-violet-100 text-violet-600" : "bg-[#f1f3f4] text-[#5f6368]")}>
                                            {isPreorder ? <Clock size={20} /> : <Package size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-[#202124] text-base capitalize">{product.name}</span>
                                                {isPreorder && (
                                                    <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-violet-200">
                                                        Pre-Venta
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-[#5f6368] line-clamp-1">{product.description || 'Sin descripción'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono text-[13px] bg-[#f1f3f4] px-2 py-1 rounded text-[#5f6368] uppercase">
                                        {product.sku}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                                                isPreorder
                                                    ? "bg-violet-50 text-violet-700 border-violet-200"
                                                    : isOutOfStock
                                                        ? "bg-[#fce8e6] text-[#d93025] border-[#f5c2c7]"
                                                        : isLowStock
                                                            ? "bg-[#fef7e0] text-[#b06000] border-[#feefc3]"
                                                            : "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]"
                                            )}>
                                                {product.stock} {product.unit || 'uds'}
                                            </span>
                                            {isLowStock && !isPreorder && <AlertTriangle size={14} className="text-[#f9ab00]" />}
                                        </div>
                                        {isPreorder && (
                                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                <Lock size={10} /> Pendiente de recepción
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {arrivalDate ? (
                                        <div className="flex flex-col">
                                            <div className="flex items-center space-x-1.5">
                                                <CalendarCheck size={14} className={isPreorder ? "text-violet-500" : "text-[#1e8e3e]"} />
                                                <span className="text-sm text-[#202124]">
                                                    {arrivalDate.toLocaleDateString('es-CL')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[#5f6368] font-medium ml-5">
                                                {isPreorder ? 'Estimada (Pre-Venta)' : 'Recibido'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-[#5f6368]">—</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center justify-end space-x-3">
                                        <div className="flex items-center bg-[#f1f3f4] rounded-full p-1 border border-[#dadce0]">
                                            <button
                                                onClick={() => !isPreorderBlocked && onReturn(product)}
                                                disabled={isPreorderBlocked}
                                                className={cn(
                                                    "flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all",
                                                    isPreorderBlocked
                                                        ? "text-[#dadce0] cursor-not-allowed"
                                                        : "hover:bg-white hover:text-[#1a73e8] text-[#5f6368]"
                                                )}
                                                title={isPreorderBlocked ? "Bloqueado: producto en pre-venta, aún no ha llegado" : "Registrar Retorno de Producto (Devolución)"}
                                            >
                                                {isPreorderBlocked ? <Lock size={14} /> : <Plus size={14} />}
                                                <span>Retorno</span>
                                            </button>
                                            <button
                                                onClick={() => !isPreorderBlocked && onSell(product)}
                                                disabled={isPreorderBlocked}
                                                className={cn(
                                                    "flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all",
                                                    isPreorderBlocked
                                                        ? "text-[#dadce0] cursor-not-allowed"
                                                        : "hover:bg-white hover:text-[#1a73e8] text-[#5f6368]"
                                                )}
                                                title={isPreorderBlocked ? "Bloqueado: producto en pre-venta, aún no ha llegado" : "Extraer Stock"}
                                            >
                                                {isPreorderBlocked ? <Lock size={14} /> : <ShoppingCart size={14} />}
                                                <span>Salida</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1a73e8] rounded-full transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="p-2 text-[#5f6368] hover:bg-[#fce8e6] hover:text-[#d93025] rounded-full transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

