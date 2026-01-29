import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle, FileText, Hash, ArrowDownLeft, Upload, FileCheck } from 'lucide-react';

export const StockInModal = ({ product, onSubmit, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [reference, setReference] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!reference.trim()) {
            setError("La referencia (ej. Factura) es obligatoria");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(product.id, parseInt(quantity), reference, file);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden animate-fade-in border border-white/5 shadow-2xl">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <PackagePlus size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Abastecer Stock</h2>
                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Entrada de Inventario</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Product Summary */}
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary-400 font-black">
                            {product.sku.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-black text-white">{product.name}</p>
                            <p className="text-xs text-slate-500 font-medium">Stock actual: {product.stock} unidades</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-3 animate-shake">
                            <AlertCircle size={18} />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
                                <Hash size={14} />
                                <span>Cantidad</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full input-glass rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
                                <FileText size={14} />
                                <span>Referencia</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Factura #1234"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full input-glass rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
                            <Upload size={14} />
                            <span>Documento Adjunto (Opcional)</span>
                        </label>
                        <div className={`relative group transition-all duration-300 ${file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.03]'} border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/30 hover:bg-primary-500/5`}>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            {file ? (
                                <div className="flex flex-col items-center space-y-2 animate-scale-in">
                                    <div className="bg-emerald-500/20 p-3 rounded-full">
                                        <FileCheck size={28} className="text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300"
                                    >
                                        Quitar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Upload size={28} />
                                    <p className="text-sm font-bold">Subir Guía de Remisión, PDF o imagen...</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-50 text-center">Formato: PDF, Doc, JPG, PNG (Max. 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 group flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ArrowDownLeft size={20} className="group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
                                    <span>REGISTRAR ENTRADA</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
