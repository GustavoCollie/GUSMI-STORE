import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Plus, Hash, ExternalLink, Package } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SupplierForm = ({ onClose, onSubmit, loading, initialData, products = [] }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '', // Note: phone wasn't in previous form but it's in state, keeping it for robustness
        ruc: initialData?.ruc || '',
        contact_name: initialData?.contact_name || '',
        contact_position: initialData?.contact_position || '',
        product_ids: initialData?.product_ids || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const product_ids = prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId];
            return { ...prev, product_ids };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e6f4ea] text-[#1e8e3e] p-2.5 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-[#202124]">
                                {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">
                                {initialData ? 'Actualiza la información del socio comercial' : 'Registra un nuevo socio comercial en el directorio'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Nombre Comercial</label>
                            <input
                                type="text"
                                required
                                className="google-input"
                                placeholder="Ej: Global Supply Peru"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">RUC (11 dígitos)</label>
                            <div className="relative group">
                                <Hash size={16} className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" />
                                <input
                                    type="text"
                                    required
                                    maxLength="11"
                                    minLength="11"
                                    className="google-input google-input-icon font-mono"
                                    placeholder="20123456789"
                                    value={formData.ruc}
                                    onChange={e => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit'] md:col-span-2">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" />
                                <input
                                    type="email"
                                    required
                                    className="google-input google-input-icon"
                                    placeholder="contacto@proveedor.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Persona de Contacto</label>
                            <input
                                type="text"
                                className="google-input"
                                placeholder="Nombre completo"
                                value={formData.contact_name}
                                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Cargo</label>
                            <input
                                type="text"
                                className="google-input"
                                placeholder="Ej: Jefe de Ventas"
                                value={formData.contact_position}
                                onChange={e => setFormData({ ...formData, contact_position: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 font-['Outfit'] md:col-span-2">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Productos que Provee</label>
                            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                                {products && products.length > 0 ? (
                                    products.map(p => (
                                        <label key={p.id} className="flex items-center space-x-3 cursor-pointer group hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-[#dadce0]">
                                            <input
                                                type="checkbox"
                                                checked={formData.product_ids.includes(p.id)}
                                                onChange={() => handleProductToggle(p.id)}
                                                className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#202124] font-medium group-hover:text-[#1a73e8] transition-colors">{p.name}</span>
                                                <span className="text-[10px] text-[#5f6368] uppercase tracking-wider">SKU: {p.sku}</span>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package size={24} className="mx-auto text-[#bdc1c6] mb-2" />
                                        <p className="text-[11px] text-[#5f6368] italic">No hay productos disponibles para asignar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#dadce0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "px-10 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2",
                                initialData ? "bg-[#1e8e3e] hover:bg-[#1b7e37] text-white" : "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                            )}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-2"></div>
                            ) : (
                                initialData ? <ExternalLink size={18} /> : <Plus size={18} />
                            )}
                            <span>{initialData ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
