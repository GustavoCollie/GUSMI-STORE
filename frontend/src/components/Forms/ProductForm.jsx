import React, { useState, useRef } from 'react';
import { X, Package, PackagePlus, AlertCircle, Edit, DollarSign, Box, Tag, AlignLeft, Hash, FileText, Upload, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProductForm = ({ onSubmit, onClose, initialData }) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        stock: initialData?.stock || '0',
        sku: initialData?.sku || '',
        initial_reference: initialData?.initial_reference || ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = {
                ...formData,
                stock: parseInt(formData.stock)
            };

            if (file) {
                data.file = file;
            }

            await onSubmit(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in/20">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header Section */}
                <div className="relative p-6 bg-emerald-50 border-b border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg">
                                <Package className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                    {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                                </h3>
                                <p className="text-xs text-emerald-600 font-black uppercase tracking-widest mt-1">
                                    {isEdit ? 'Modificar ficha técnica' : 'Registro de inventario'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                    {error && (
                        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl text-sm flex items-center space-x-3 animate-shake font-bold">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Producto</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                placeholder="Ej: Monitor Pro 27\"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
                                placeholder="Detalles técnicos o notas..."
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Stock Inicial</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                disabled={isEdit}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">SKU / Código</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                placeholder="PROD-001"
                                required
                            />
                        </div>
                    </div>

                    {/* Traceability Fields (Reference and File) */}
                    <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Referencia Inicial / Guía</label>
                            <input
                                type="text"
                                value={formData.initial_reference}
                                onChange={(e) => setFormData({ ...formData, initial_reference: e.target.value })}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                placeholder="GR-2026-001"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Documento Soporte</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer shadow-sm group",
                                    file
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-white border-slate-100 hover:border-emerald-300 hover:bg-emerald-50"
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
                                    <div className="flex flex-col items-center space-y-2 text-emerald-700">
                                        <FileText size={24} />
                                        <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
                                        <X
                                            size={16}
                                            className="text-rose-500 hover:scale-125 transition-transform"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <Upload size={24} />
                                        <span className="text-xs font-black uppercase tracking-widest">Subir Comprobante</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3",
                            isEdit
                                ? 'bg-indigo-600 hover:bg-indigo-500'
                                : 'bg-emerald-600 hover:bg-emerald-500'
                        )}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white"></div>
                        ) : (
                            <Plus size={22} />
                        )}
                        <span>{isEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

