import React, { useState } from 'react';
import { X, Users, Mail, Phone, Plus, Hash, Search, ExternalLink, Eye, Package } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SupplierForm = ({ onClose, onSubmit, onUpdate, onDelete, loading, suppliers = [], products = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ruc: '',
        contact_name: '',
        contact_position: '',
        product_ids: []
    });
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingProductsSupplier, setViewingProductsSupplier] = useState(null);

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            ruc: supplier.ruc || '',
            contact_name: supplier.contact_name || '',
            contact_position: supplier.contact_position || '',
            product_ids: supplier.product_ids || []
        });
    };

    const cancelEdit = () => {
        setEditingSupplier(null);
        setFormData({ name: '', email: '', phone: '', ruc: '', contact_name: '', contact_position: '', product_ids: [] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            onUpdate(editingSupplier.id, formData);
        } else {
            onSubmit(formData);
        }
        cancelEdit();
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const product_ids = prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId];
            return { ...prev, product_ids };
        });
    };

    const filteredSuppliers = suppliers.filter(s => {
        const search = searchTerm.toLowerCase();
        return (
            s.name.toLowerCase().includes(search) ||
            s.ruc.includes(search) ||
            (s.contact_name && s.contact_name.toLowerCase().includes(search)) ||
            (s.products && s.products.some(p => p.toLowerCase().includes(search)))
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e6f4ea] text-[#1e8e3e] p-2.5 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-[#202124]">Gestión de Proveedores</h2>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">Directorio central de abastecimiento</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-[#f8f9fa] p-6 rounded-2xl border border-[#dadce0]">
                                <h3 className="text-[13px] font-bold text-[#202124] uppercase tracking-wider mb-5 flex items-center">
                                    {editingSupplier ? <ExternalLink size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                                    {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">Nombre Comercial</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                            placeholder="Ej: Global Supply"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">RUC (11 dígitos)</label>
                                        <div className="relative">
                                            <Hash size={14} className="absolute left-3 top-2.5 text-[#5f6368]" />
                                            <input
                                                type="text"
                                                required
                                                maxLength="11"
                                                minLength="11"
                                                className="w-full bg-white border border-[#dadce0] rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-mono"
                                                placeholder="20123456789"
                                                value={formData.ruc}
                                                onChange={e => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">Email</label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-2.5 text-[#5f6368]" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-white border border-[#dadce0] rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                                placeholder="proveedor@empresa.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">Persona de Contacto</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                            placeholder="Nombre del encargado"
                                            value={formData.contact_name}
                                            onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">Puesto / Cargo</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                            placeholder="Ej: Gerente de Ventas"
                                            value={formData.contact_position}
                                            onChange={e => setFormData({ ...formData, contact_position: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[12px] font-medium text-[#5f6368] ml-1">Productos que Provee</label>
                                        <div className="bg-white border border-[#dadce0] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                                            {products && products.length > 0 ? (
                                                products.map(p => (
                                                    <label key={p.id} className="flex items-center space-x-2 cursor-pointer group hover:bg-[#f8f9fa] p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.product_ids.includes(p.id)}
                                                            onChange={() => handleProductToggle(p.id)}
                                                            className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
                                                        />
                                                        <span className="text-xs text-[#202124] group-hover:text-[#1a73e8]">{p.name} <span className="text-[10px] text-[#5f6368]">(SKU: {p.sku})</span></span>
                                                    </label>
                                                ))
                                            ) : (
                                                <p className="text-[11px] text-[#5f6368] italic py-2 text-center">No hay productos registrados</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50",
                                                editingSupplier ? "bg-[#1e8e3e] hover:bg-[#1b7e37] text-white" : "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                                            )}
                                        >
                                            {loading ? 'Guardando...' : editingSupplier ? 'Actualizar' : 'Registrar Proveedor'}
                                        </button>
                                        {editingSupplier && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="px-4 py-2.5 bg-white border border-[#dadce0] text-[#5f6368] rounded-lg text-sm font-medium hover:bg-[#f1f3f4] transition-all"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-3 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-bold text-[#5f6368] uppercase tracking-wider ml-1">Proveedores Activos</h3>
                                <div className="relative w-64 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar proveedor o producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-full pl-10 pr-4 py-1.5 text-xs outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Inter']"
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
                                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-[#f8f9fa] z-10">
                                            <tr className="border-b border-[#dadce0]">
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Empresa</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">RUC / ID</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Contacto</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Productos</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest text-center">Estado</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-widest text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f1f3f4]">
                                            {filteredSuppliers.map((s) => (
                                                <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                {s.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-[#202124] leading-tight">{s.name}</div>
                                                                <div className="text-[10px] text-[#5f6368] flex items-center mt-0.5">
                                                                    <Mail size={10} className="mr-1" /> {s.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-[#5f6368] font-mono">
                                                        {s.ruc}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {s.contact_name ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-medium text-[#202124]">{s.contact_name}</span>
                                                                <span className="text-[10px] text-[#1a73e8]">{s.contact_position || 'Sin cargo'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-[#bdc1c6] italic">No registrado</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {s.products && s.products.length > 0 ? (
                                                            <button
                                                                onClick={() => setViewingProductsSupplier(s)}
                                                                className="flex items-center text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-full hover:bg-[#d2e3fc] transition-colors group/btn"
                                                            >
                                                                <Eye size={12} className="mr-1.5" />
                                                                Ver {s.products.length} productos
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-[#bdc1c6] italic">Sin productos</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f4ea] text-[#1e8e3e] uppercase border border-[#1e8e3e]/10">
                                                            Activo
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <button
                                                                onClick={() => handleEdit(s)}
                                                                className="p-1.5 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1a73e8] rounded-full transition-all"
                                                                title="Editar Proveedor"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
                                                                        onDelete(s.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 text-[#5f6368] hover:bg-[#fce8e6] hover:text-[#d93025] rounded-full transition-all"
                                                                title="Eliminar Proveedor"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredSuppliers.length === 0 && (
                                    <div className="py-12 text-center flex-1 flex flex-col items-center justify-center">
                                        <Users size={32} className="text-[#bdc1c6] mb-2" />
                                        <p className="text-sm text-[#5f6368]">
                                            {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay proveedores registrados aún'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-[#dadce0] bg-[#f8f9fa] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full text-sm font-medium text-[#202124] bg-white border border-[#dadce0] hover:bg-[#f1f3f4] transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Products Modal */}
            {viewingProductsSupplier && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
                            <div>
                                <h3 className="text-lg font-medium text-[#202124]">Productos Asignados</h3>
                                <p className="text-xs text-[#5f6368]">{viewingProductsSupplier.name}</p>
                            </div>
                            <button
                                onClick={() => setViewingProductsSupplier(null)}
                                className="p-1.5 hover:bg-[#e8eaed] rounded-full transition-colors text-[#5f6368]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {viewingProductsSupplier.products.map((p, idx) => (
                                <div key={idx} className="px-6 py-3 border-b border-[#f1f3f4] last:border-0 hover:bg-[#f8f9fa] flex items-center space-x-3">
                                    <div className="bg-[#e8f0fe] p-2 rounded-lg text-[#1a73e8]">
                                        <Package size={16} />
                                    </div>
                                    <span className="text-sm text-[#202124]">{p}</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#dadce0] flex justify-end">
                            <button
                                onClick={() => setViewingProductsSupplier(null)}
                                className="px-4 py-1.5 bg-white border border-[#dadce0] rounded-lg text-sm font-medium text-[#202124] hover:bg-[#f1f3f4] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
