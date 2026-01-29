import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Plus, Box, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StockInModal = ({ product, onClose, onConfirm, loading }) => {
    const [quantity, setQuantity] = useState(1);
    const [reference, setReference] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (quantity <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }
        if (!reference.trim()) {
            setError("La referencia es obligatoria");
            return;
        }

        try {
            await onConfirm(product.id, {
                quantity: parseInt(quantity),
                reference,
                file
            });
        } catch (err) {
            setError(err.message || "Error al añadir stock");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in/20">
            <div
                className="bg-white/95 border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-600 rounded-xl">
                            <Plus className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Reponer Stock</h3>
                            <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Entrada de Mercadería</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Product Info Card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex justify-between items-center shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-tight">{product.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    product.stock > 5
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    Stock actual: {product.stock}
                                </span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            {product.sku}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center text-red-600 text-sm animate-shake">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cantidad a Añadir</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="0"
                            />
                        </div>

                        {/* Reference/Guide */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Referencia / Guía</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="GR-2026-001"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documento Soporte</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "flex items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center",
                                file
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {file ? (
                                <div className="flex items-center space-x-2 text-emerald-700 overflow-hidden">
                                    <FileText size={18} className="flex-shrink-0" />
                                    <span className="text-[10px] font-bold truncate max-w-[200px]">{file.name}</span>
                                    <X
                                        size={14}
                                        className="cursor-pointer hover:text-rose-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-1 text-slate-400">
                                    <Upload size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Adjuntar Soporte</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.98]",
                            loading
                                ? "bg-slate-200 text-slate-400 cursor-wait"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        )}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white mr-2"></div>
                        ) : (
                            <Plus size={20} />
                        )}
                        <span>Confirmar Entrada</span>
                    </button>
                </form>
            </div>
        </div >
    );
};
