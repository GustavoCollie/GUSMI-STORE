import React, { useState } from 'react';
import { X, ShoppingCart, AlertCircle, Hash, Box } from 'lucide-react';

export const SellProductModal = ({ product, onSubmit, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [orderNumber, setOrderNumber] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!orderNumber.trim()) {
            setError("El número de orden es obligatorio");
            return;
        }

        if (quantity > product.stock) {
            setError("No hay suficiente stock disponible");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(product.id, parseInt(quantity), orderNumber);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                                <ShoppingCart className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Registrar Salida</h2>
                                <p className="text-xs text-slate-400 uppercase tracking-tighter">Salida de Stock de Almacén</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Info Summary */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-200">{product.name}</span>
                            <span className="text-xs font-mono text-blue-400">{product.sku}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Box size={14} />
                            <span>Stock disponible: <strong className="text-slate-200">{product.stock}</strong></span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-sm animate-shake">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                                <div className="flex items-center space-x-2">
                                    <Hash size={14} />
                                    <span>Orden de Compra / Referencia</span>
                                </div>
                            </label>
                            <input
                                required
                                autoFocus
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Ej: OC-2026-001"
                                className="w-full input-glass rounded-xl px-4 py-3 text-white placeholder:text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Cantidad de Salida</label>
                            <div className="flex items-center space-x-4">
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full input-glass rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || product.stock === 0}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Procesando Salida...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                    <span>Confirmar Salida</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
