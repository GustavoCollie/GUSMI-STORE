import React, { useState } from 'react';
import { X, ShoppingCart, Calendar, DollarSign, Package, Users, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PurchaseOrderForm = ({ suppliers, products, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        supplier_id: '',
        product_id: '',
        quantity: 1,
        unit_price: 0,
        savings_amount: 0,
        freight_amount: 0,
        other_expenses_amount: 0,
        other_expenses_description: '',
        expected_delivery_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);
    const assignedProductIds = selectedSupplier?.product_ids || [];

    // Group products: assigned vs others
    const assignedProducts = products.filter(p => assignedProductIds.includes(p.id));
    const otherProducts = products.filter(p => !assignedProductIds.includes(p.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e8f0fe] text-[#1a73e8] p-2.5 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-[#202124]">Nueva Orden de Compra</h2>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">Registrar pedido oficial a proveedor</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Proveedor</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3.5 top-3 text-[#5f6368]" />
                                <select
                                    required
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all appearance-none"
                                    value={formData.supplier_id}
                                    onChange={e => {
                                        setFormData({
                                            ...formData,
                                            supplier_id: e.target.value,
                                            product_id: '' // Reset product when supplier changes
                                        });
                                    }}
                                >
                                    <option value="">Seleccionar Proveedor</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Producto</label>
                            <div className="relative">
                                <Package size={16} className="absolute left-3.5 top-3 text-[#5f6368]" />
                                <select
                                    required
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all appearance-none"
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                    disabled={!formData.supplier_id}
                                >
                                    <option value="">
                                        {!formData.supplier_id
                                            ? 'Seleccione un Proveedor primero'
                                            : 'Seleccionar Producto'}
                                    </option>
                                    {assignedProducts.length > 0 && (
                                        <optgroup label="Productos Frecuentes / Asignados">
                                            {assignedProducts.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    ⭐ {p.name} (SKU: {p.sku})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {otherProducts.length > 0 && (
                                        <optgroup label="Otros Productos del Catálogo">
                                            {otherProducts.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (SKU: {p.sku})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Cantidad</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Precio Unitario</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3.5 top-3 text-[#5f6368]" />
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                    value={formData.unit_price}
                                    onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#1e8e3e] ml-1">Ahorro Negociado</label>
                            <div className="relative">
                                <TrendingDown size={16} className="absolute left-3.5 top-3 text-[#1e8e3e]" />
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-[#e6f4ea] border border-[#ceead6] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1e8e3e] outline-none focus:bg-white focus:border-[#1e8e3e] focus:ring-4 focus:ring-[#1e8e3e]/10 transition-all"
                                    value={formData.savings_amount}
                                    onChange={e => setFormData({ ...formData, savings_amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Entrega Estimada</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-3 text-[#5f6368]" />
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                    value={formData.expected_delivery_date}
                                    onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f8f9fa] p-6 rounded-xl border border-[#dadce0]">
                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#c5221f] ml-1">Precio de Transporte / Flete</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3.5 top-3 text-[#c5221f]" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white border border-[#f5c2c7] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#c5221f] outline-none focus:border-[#d93025] focus:ring-4 focus:ring-[#d93025]/10 transition-all"
                                        placeholder="0.00"
                                        value={formData.freight_amount}
                                        onChange={e => setFormData({ ...formData, freight_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#5f6368] ml-1">Otros Gastos (Monto)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3.5 top-3 text-[#5f6368]" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white border border-[#dadce0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                        placeholder="0.00"
                                        value={formData.other_expenses_amount}
                                        onChange={e => setFormData({ ...formData, other_expenses_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#5f6368] ml-1">Descripción de Otros Gastos</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                    placeholder="Ej: Embalaje especial, aduanas, etc."
                                    value={formData.other_expenses_description}
                                    onChange={e => setFormData({ ...formData, other_expenses_description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-8 py-4 border-t border-[#dadce0] bg-[#e8f0fe]/30 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider">Total Adquisición Estimado</span>
                        <span className="text-xl font-medium text-[#202124]">
                            ${(
                                (formData.quantity * formData.unit_price) * 1.18 +
                                formData.freight_amount +
                                formData.other_expenses_amount -
                                formData.savings_amount
                            ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-full text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#1a73e8] hover:bg-[#1765cc] text-white px-8 py-2 rounded-full text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                    >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>}
                        <span>{loading ? 'Procesando...' : 'Crear Orden'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
