import React from 'react';
import { Plus, Trash2, Edit, ShoppingCart, Box, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProductTable = ({ products, onReplenish, onEdit, onDelete, onSell, loading }) => {
    const [quantities, setQuantities] = React.useState({});

    const handleQuantityChange = (id, value) => {
        setQuantities(prev => ({ ...prev, [id]: value }));
    };

    const getQuantity = (id) => {
        return quantities[id] !== undefined ? quantities[id] : "1";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20 glass-panel rounded-2xl animate-fade-in">
                <Box className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-600">Inventario Vacío</h3>
                <p className="text-slate-400 max-w-xs mx-auto">No hay productos registrados. Comienza añadiendo uno nuevo.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto glass-panel rounded-3xl border border-slate-200 shadow-xl bg-white/50">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Información del Producto</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">SKU</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado de Stock</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Gestión</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                        const qty = getQuantity(product.id);
                        const isLowStock = product.stock <= 5;

                        return (
                            <tr key={product.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors border border-slate-200">
                                            <Box size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">{product.name}</span>
                                            <span className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xs">{product.description}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-slate-500 font-mono tracking-tighter uppercase">{product.sku}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-3">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border",
                                            isLowStock
                                                ? "bg-red-50 text-red-600 border-red-100"
                                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            {product.stock} unidades
                                        </span>
                                        {isLowStock && <AlertTriangle size={14} className="text-amber-500 animate-pulse" />}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <div className="flex items-center gap-2">
                                            {/* Stock In Button */}
                                            <button
                                                onClick={() => onReplenish(product)}
                                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                                                title="Registrar Entrada"
                                            >
                                                <Plus size={14} />
                                                <span>Registro de Entradas</span>
                                            </button>

                                            {/* Stock Out Button */}
                                            <button
                                                onClick={() => onSell(product)}
                                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                                                title="Registrar Salida"
                                            >
                                                <ShoppingCart size={14} />
                                                <span>Registro de Salidas</span>
                                            </button>
                                        </div>

                                        {/* Utility: Edit/Delete */}
                                        <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="p-2 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
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

