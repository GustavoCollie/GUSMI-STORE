import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, User, Mail, Package, DollarSign, Calendar, Truck, CreditCard } from 'lucide-react';

export const SalesOrderForm = ({ products, onClose, onSubmit, loading, initialData }) => {
    const isFromOrder = !!initialData;
    const [formData, setFormData] = useState({
        customer_name: initialData?.customer_name || '',
        customer_email: initialData?.customer_email || '',
        product_id: initialData?.product_id || '',
        quantity: initialData?.quantity || 1,
        unit_price: initialData?.unit_price || '',
        shipping_cost: initialData?.shipping_cost || 0,
        shipping_type: initialData?.shipping_type || 'PICKUP',
        shipping_address: initialData?.shipping_address || '',
        delivery_date: initialData?.delivery_date ? new Date(initialData.delivery_date).toISOString().split('T')[0] : ''
    });

    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (formData.product_id) {
            const product = products.find(p => p.id === formData.product_id);
            setSelectedProduct(product);
        }
    }, [formData.product_id, products]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            quantity: parseInt(formData.quantity),
            unit_price: parseFloat(formData.unit_price),
            shipping_cost: parseFloat(formData.shipping_cost),
            delivery_date: formData.delivery_date || null
        });
    };

    const subtotal = (formData.quantity || 0) * (formData.unit_price || 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv + (parseFloat(formData.shipping_cost) || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[650px] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e8f0fe] text-[#1a73e8] p-2.5 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-[#202124]">
                                {initialData ? 'Editar Orden de Venta' : 'Nueva Orden de Venta'}
                            </h3>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">
                                {initialData
                                    ? (formData.shipping_type === 'DELIVERY' ? 'Asignar costo de envío al pedido' : 'Modificar detalles de la venta')
                                    : 'Registrar una nueva venta y programar despacho'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Cliente</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    readOnly={isFromOrder}
                                    className={`google-input google-input-icon ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Correo</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={formData.customer_email}
                                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    readOnly={isFromOrder}
                                    className={`google-input google-input-icon ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-4 pt-4 border-t border-[#dadce0]">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Producto</label>
                            <div className="relative group">
                                <Package className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                <select
                                    required
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    disabled={isFromOrder}
                                    className={`google-input google-input-icon appearance-none ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {(isFromOrder ? products : products.filter(p => p.stock > 0)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.stock_unit || 'und'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Cantidad</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max={selectedProduct?.stock}
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    readOnly={isFromOrder}
                                    className={`google-input ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Precio Unitario ($)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                        readOnly={isFromOrder}
                                        className={`google-input google-input-icon ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#dadce0]">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Tipo de Envío</label>
                            <div className="flex items-center space-x-2 p-1 bg-[#f1f3f4] rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => !isFromOrder && setFormData({ ...formData, shipping_type: 'PICKUP', shipping_cost: 0 })}
                                    disabled={isFromOrder}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-xs font-medium transition-all ${formData.shipping_type === 'PICKUP' ? 'bg-white shadow-sm text-[#1a73e8]' : 'text-[#5f6368]'} ${isFromOrder ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    <Package size={14} />
                                    <span>Recojo en Almacén</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => !isFromOrder && setFormData({ ...formData, shipping_type: 'DELIVERY' })}
                                    disabled={isFromOrder}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-xs font-medium transition-all ${formData.shipping_type === 'DELIVERY' ? 'bg-white shadow-sm text-[#1a73e8]' : 'text-[#5f6368]'} ${isFromOrder ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    <Truck size={14} />
                                    <span>Delivery / Envío</span>
                                </button>
                            </div>
                        </div>
                        {formData.shipping_type === 'DELIVERY' && (
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Costo de Envío ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.shipping_cost}
                                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                                    className="google-input"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                        {formData.shipping_type === 'DELIVERY' && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Dirección de Entrega</label>
                                <div className="relative group">
                                    <Truck className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={formData.shipping_address || ''}
                                        onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                        readOnly={isFromOrder}
                                        className={`google-input google-input-icon ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                        placeholder="Dirección completa, Distrito, Referencia"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Fecha de Entrega</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                <input
                                    type="date"
                                    value={formData.delivery_date}
                                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                    readOnly={isFromOrder}
                                    className={`google-input google-input-icon ${isFromOrder ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#f8f9fa] rounded-xl p-6 space-y-3 border border-[#dadce0]">
                        <div className="flex justify-between text-sm">
                            <span className="text-[#5f6368]">Subtotal</span>
                            <span className="font-medium text-[#202124]">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[#5f6368]">IGV (18%)</span>
                            <span className="font-medium text-[#202124]">${igv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {formData.shipping_type === 'DELIVERY' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-[#5f6368]">Envío</span>
                                <span className="font-medium text-[#202124]">${(parseFloat(formData.shipping_cost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-[#dadce0] flex justify-between items-center">
                            <span className="text-base font-medium text-[#202124]">Total a Pagar</span>
                            <span className="text-2xl font-medium text-[#1a73e8]">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4">
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
                            className="bg-[#1a73e8] text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                            ) : (
                                <CreditCard size={18} />
                            )}
                            <span>{initialData ? 'Guardar Cambios' : 'Crear Orden de Venta'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
