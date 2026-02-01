import React from 'react';
import { Plus, Trash2, Edit, ShoppingCart, Box, AlertTriangle, MoreVertical, Package } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProductTable = ({ products, onReturn, onEdit, onDelete, onSell, loading }) => {
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

    return (
        <div className="overflow-x-auto bg-white">
            <table className="google-table">
                <thead>
                    <tr>
                        <th>Producto / Descripción</th>
                        <th>SKU</th>
                        <th>Estado de Existencias</th>
                        <th className="text-right">Acciones de Almacén</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const isLowStock = product.stock > 0 && product.stock <= 5;
                        const isOutOfStock = product.stock === 0;

                        return (
                            <tr key={product.id} className="hover:bg-[#f8f9fa] transition-colors">
                                <td className="font-['Outfit']">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#f1f3f4] flex items-center justify-center text-[#5f6368]">
                                            <Package size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#202124] text-base capitalize">{product.name}</span>
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
                                    <div className="flex items-center space-x-2">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                                            isOutOfStock
                                                ? "bg-[#fce8e6] text-[#d93025] border-[#f5c2c7]"
                                                : isLowStock
                                                    ? "bg-[#fef7e0] text-[#b06000] border-[#feefc3]"
                                                    : "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]"
                                        )}>
                                            {product.stock} {product.unit || 'uds'}
                                        </span>
                                        {isLowStock && <AlertTriangle size={14} className="text-[#f9ab00]" />}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-end space-x-3">
                                        <div className="flex items-center bg-[#f1f3f4] rounded-full p-1 border border-[#dadce0]">
                                            <button
                                                onClick={() => onReturn(product)}
                                                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full hover:bg-white hover:text-[#1a73e8] text-[#5f6368] text-[12px] font-medium transition-all"
                                                title="Registrar Retorno de Producto (Devolución)"
                                            >
                                                <Plus size={14} />
                                                <span>Retorno</span>
                                            </button>
                                            <button
                                                onClick={() => onSell(product)}
                                                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full hover:bg-white hover:text-[#1a73e8] text-[#5f6368] text-[12px] font-medium transition-all"
                                                title="Extraer Stock"
                                            >
                                                <ShoppingCart size={14} />
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

