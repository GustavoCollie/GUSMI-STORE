import React, { useState } from 'react';
import { Users, Mail, Search, ExternalLink, Eye, Package, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SupplierTable = ({ suppliers, onEdit, onDelete, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingProductsSupplier, setViewingProductsSupplier] = useState(null);

    // Filter only active suppliers and apply search
    const filteredSuppliers = suppliers.filter(s => {
        if (!s.is_active) return false;

        const search = searchTerm.toLowerCase();
        return (
            s.name.toLowerCase().includes(search) ||
            s.ruc.includes(search) ||
            (s.contact_name && s.contact_name.toLowerCase().includes(search))
        );
    });

    const productsModal = viewingProductsSupplier && (
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
                    {viewingProductsSupplier.products && viewingProductsSupplier.products.length > 0 ? (
                        viewingProductsSupplier.products.map((p, idx) => (
                            <div key={idx} className="px-6 py-3 border-b border-[#f1f3f4] last:border-0 hover:bg-[#f8f9fa] flex items-center space-x-3">
                                <div className="bg-[#e8f0fe] p-2 rounded-lg text-[#1a73e8]">
                                    <Package size={16} />
                                </div>
                                <span className="text-sm text-[#202124]">{p}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-[#5f6368] text-sm italic">
                            No hay productos asignados a este proveedor.
                        </div>
                    )}
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
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#5f6368] uppercase tracking-wider ml-1">Directorio de Proveedores</h3>
                <div className="relative w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar proveedor o RUC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-full pl-10 pr-4 py-1.5 text-xs outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="google-table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>RUC / ID</th>
                                <th>Contacto</th>
                                <th>Productos</th>
                                <th className="text-center">Estado</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((s) => (
                                <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-base flex-shrink-0">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[#202124] leading-tight">{s.name}</div>
                                                <div className="text-[11px] text-[#5f6368] flex items-center mt-0.5">
                                                    <Mail size={12} className="mr-1" /> {s.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-mono text-xs bg-[#f1f3f4] px-2 py-0.5 rounded text-[#5f6368]">
                                            {s.ruc}
                                        </span>
                                    </td>
                                    <td>
                                        {s.contact_name ? (
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-medium text-[#202124]">{s.contact_name}</span>
                                                <span className="text-[11px] text-[#1a73e8]">{s.contact_position || 'Sin cargo'}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-[#bdc1c6] italic">No registrado</span>
                                        )}
                                    </td>
                                    <td>
                                        {s.products && s.products.length > 0 ? (
                                            <button
                                                onClick={() => setViewingProductsSupplier(s)}
                                                className="flex items-center text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-full hover:bg-[#d2e3fc] transition-colors"
                                            >
                                                <Eye size={14} className="mr-1.5" />
                                                {s.products.length} {s.products.length === 1 ? 'Producto' : 'Productos'}
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-[#bdc1c6] italic">Sin productos</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#1e8e3e] uppercase border border-[#ceead6]">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => onEdit(s)}
                                                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1a73e8] rounded-full transition-all"
                                                title="Editar"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('¿Eliminar este proveedor permanentemente?')) {
                                                        onDelete(s.id);
                                                    }
                                                }}
                                                className="p-2 text-[#5f6368] hover:bg-[#fce8e6] hover:text-[#d93025] rounded-full transition-all"
                                                title="Eliminar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredSuppliers.length === 0 && (
                    <div className="py-24 text-center border-t border-[#f1f3f4]">
                        <Users size={48} className="mx-auto text-[#dadce0] mb-4" />
                        <h4 className="text-lg font-medium text-[#202124]">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay proveedores activos'}
                        </h4>
                        <p className="text-sm text-[#5f6368] mt-1">
                            {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Registra un nuevo proveedor para empezar.'}
                        </p>
                    </div>
                )}
            </div>
            {productsModal}
        </div>
    );
};
