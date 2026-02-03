import React, { useState, useRef } from 'react';
import { X, Upload, FileText, User, Users, Clock, AlertCircle, ShoppingCart, Tag, Mail, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SellProductModal = ({ product, salesOrders = [], onClose, onConfirm, loading }) => {
    const [exitType, setExitType] = useState('internal'); // 'internal' or 'sale'
    const [selectedSalesOrderId, setSelectedSalesOrderId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reference, setReference] = useState('');
    const [applicant, setApplicant] = useState('');
    const [applicantArea, setApplicantArea] = useState('');
    const [isReturnable, setIsReturnable] = useState(false);
    const [returnDeadline, setReturnDeadline] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
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
        if (quantity > product.stock) {
            setError(`Stock insuficiente. Disponible: ${product.stock}`);
            return;
        }
        if (exitType === 'internal' && !applicant.trim()) {
            setError("El solicitante es obligatorio");
            return;
        }
        if (exitType === 'internal' && !applicantArea.trim()) {
            setError("El área solicitante es obligatoria");
            return;
        }
        if (exitType === 'sale' && !selectedSalesOrderId) {
            setError("Debe seleccionar una orden de venta");
            return;
        }
        if (exitType === 'sale' && !recipientEmail.trim()) {
            setError("El correo del cliente es obligatorio");
            return;
        }
        if (exitType === 'sale' && !returnDeadline) { // Usamos returnDeadline para "fecha de entrega" si es venta? No, mejor no mezclar.
            setError("La fecha de entrega es obligatoria");
            return;
        }

        try {
            await onConfirm(product.id, {
                quantity: parseInt(quantity),
                reference: exitType === 'sale' ? `VENTA: OV-${selectedSalesOrderId.substring(0, 8)}` : reference,
                applicant: exitType === 'sale' ? "CLIENTE EXTERNO" : applicant,
                applicant_area: exitType === 'sale' ? "VENTAS" : applicantArea,
                is_returnable: exitType === 'sale' ? false : isReturnable,
                return_deadline: exitType === 'sale' ? returnDeadline : (isReturnable ? returnDeadline : null),
                recipient_email: recipientEmail || null,
                sales_order_id: exitType === 'sale' ? selectedSalesOrderId : null,
                file
            });
        } catch (err) {
            setError(err.message || "Error al registrar la salida");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#fef7e0] text-[#f9ab00] p-2.5 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-[#202124]">Registrar Salida</h3>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">Salida de mercadería del almacén</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                    {/* Item Context */}
                    <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0] flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">PRODUCTO</span>
                            <h4 className="text-sm font-medium text-[#202124]">{product.name}</h4>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">STOCK DISPONIBLE</span>
                            <p className="text-sm font-medium text-[#f9ab00]">{product.stock} uds</p>
                        </div>
                    </div>

                    {/* Exit Type Selection */}
                    <div className="flex items-center space-x-2 p-1 bg-[#f1f3f4] rounded-xl border border-[#dadce0]">
                        <button
                            type="button"
                            onClick={() => setExitType('internal')}
                            className={cn(
                                "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                                exitType === 'internal' ? "bg-white shadow-sm text-[#1a73e8]" : "text-[#5f6368] hover:bg-white/50"
                            )}
                        >
                            <Users size={18} />
                            <span>Consumo Interno</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setExitType('sale')}
                            className={cn(
                                "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                                exitType === 'sale' ? "bg-white shadow-sm text-[#1a73e8]" : "text-[#5f6368] hover:bg-white/50"
                            )}
                        >
                            <ShoppingCart size={18} />
                            <span>Venta Directa</span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-[#fce8e6] border border-[#f5c2c7] rounded-xl p-4 flex items-center text-[#d93025] text-sm animate-shake">
                            <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {exitType === 'sale' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-[#e8f0fe] border border-[#1a73e8]/10 rounded-xl p-4 flex items-start space-x-3">
                                <Tag className="text-[#1a73e8] mt-0.5" size={18} />
                                <div>
                                    <p className="text-[13px] font-medium text-[#1a73e8]">Conectar con Orden de Venta</p>
                                    <p className="text-[11px] text-[#5f6368] mt-0.5">Selecciona una orden de venta pendiente para automatizar los datos de salida.</p>
                                </div>
                            </div>

                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#202124] ml-1 uppercase tracking-wider text-[10px]">Órdenes Disponibles</label>
                                <div className="relative group">
                                    <ShoppingCart className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8]" size={18} />
                                    <select
                                        value={selectedSalesOrderId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedSalesOrderId(val);
                                            const order = salesOrders.find(o => o.id.toString() === val.toString());
                                            if (order) {
                                                setQuantity(order.quantity);
                                                setRecipientEmail(order.customer_email);
                                                if (order.delivery_date) {
                                                    setReturnDeadline(order.delivery_date.split('T')[0]);
                                                }
                                            }
                                        }}
                                        className="google-input google-input-icon appearance-none bg-white"
                                    >
                                        <option value="">-- Buscar orden pendiente --</option>
                                        {salesOrders
                                            .filter(o => o.product_id?.toString() === product.id?.toString() && o.status === 'PENDING')
                                            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                                            .map((o, idx) => (
                                                <option key={o.id} value={o.id}>
                                                    #{idx + 1} OV-{o.id.toString().substring(0, 8)} | {o.customer_name} ({o.quantity} uds)
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                {salesOrders.filter(o => o.product_id?.toString() === product.id?.toString() && o.status === 'PENDING').length === 0 && (
                                    <p className="text-[10px] text-[#b06000] font-medium ml-1 mt-1 flex items-center">
                                        <AlertTriangle size={10} className="mr-1" />
                                        No hay órdenes de venta pendientes para este producto.
                                    </p>
                                )}
                            </div>

                            {selectedSalesOrderId && (
                                <div className="bg-[#e8f0fe] rounded-xl p-5 border border-[#1a73e8]/20 space-y-4 animate-scale-in">
                                    <div className="flex items-center justify-between border-b border-[#1a73e8]/10 pb-3">
                                        <h4 className="text-sm font-bold text-[#1a73e8] uppercase tracking-wider">Detalles del Pedido</h4>
                                        <span className="bg-[#1a73e8] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Confirmado</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#5f6368] uppercase">Cliente</p>
                                            <p className="text-sm font-medium text-[#202124]">{salesOrders.find(o => o.id.toString() === selectedSalesOrderId.toString())?.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#5f6368] uppercase">Cantidad</p>
                                            <p className="text-sm font-medium text-[#202124]">{quantity} unidades</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#5f6368] uppercase">Tipo de Entrega</p>
                                            <p className="text-sm font-medium text-[#202124]">{salesOrders.find(o => o.id.toString() === selectedSalesOrderId.toString())?.shipping_type === 'DELIVERY' ? 'A Domicilio' : 'Retiro en Local'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#5f6368] uppercase">Correo</p>
                                            <p className="text-sm font-medium text-[#202124] truncate">{recipientEmail}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#1a73e8]/10">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="text-[#1a73e8]" size={16} />
                                            <span className="text-[11px] font-bold text-[#5f6368] uppercase">Fecha de Entrega Estimada:</span>
                                            <span className="text-sm font-medium text-[#202124]">{returnDeadline}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="google-input"
                                    />
                                </div>

                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Referencia / Guía (Opcional)</label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        className="google-input"
                                        placeholder="Ej: GR-2026-X"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Solicitante</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={applicant}
                                            onChange={(e) => setApplicant(e.target.value)}
                                            className="google-input google-input-icon"
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Área / Dept.</label>
                                    <div className="relative group">
                                        <Users className="absolute left-3 top-2.5 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={applicantArea}
                                            onChange={(e) => setApplicantArea(e.target.value)}
                                            className="google-input google-input-icon"
                                            placeholder="Área de trabajo"
                                        />
                                    </div>
                                </div>
                            </div>

                            {exitType !== 'sale' && (
                                <div className="space-y-5 pt-4 border-t border-[#dadce0]">
                                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0]">
                                        <div className="flex items-center space-x-3">
                                            <Clock size={20} className={isReturnable ? "text-[#d93025]" : "text-[#5f6368]"} />
                                            <div>
                                                <h4 className="text-sm font-medium text-[#202124]">¿Es un producto devolutivo?</h4>
                                                <p className="text-[11px] text-[#5f6368]">Indica si el producto debe retornar al almacén</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isReturnable}
                                            onChange={(e) => setIsReturnable(e.target.checked)}
                                            className="w-5 h-5 accent-[#1a73e8] cursor-pointer"
                                        />
                                    </div>

                                    {isReturnable && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                            <div className="space-y-1.5 font-['Outfit']">
                                                <label className="text-[13px] font-medium text-[#202124] ml-1 text-[#d93025]">Fecha de retorno</label>
                                                <input
                                                    type="date"
                                                    value={returnDeadline}
                                                    onChange={(e) => setReturnDeadline(e.target.value)}
                                                    className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#d93025] focus:ring-4 focus:ring-[#d93025]/10 transition-all font-['Outfit']"
                                                />
                                            </div>
                                            <div className="space-y-1.5 font-['Outfit']">
                                                <label className="text-[13px] font-medium text-[#202124] ml-1 text-[#d93025]">Correo del receptor</label>
                                                <input
                                                    type="email"
                                                    value={recipientEmail}
                                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                                    className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#d93025] focus:ring-4 focus:ring-[#d93025]/10 transition-all font-['Outfit']"
                                                    placeholder="email@ejemplo.com"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-5 pt-4 border-t border-[#dadce0]">
                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Documento soporte (Opcional)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                                    file ? "bg-[#e5f4ea] border-[#1e8e3e]" : "bg-[#f8f9fa] border-[#dadce0] hover:border-[#1a73e8]"
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
                                    <div className="flex items-center space-x-2 text-[#1e8e3e]">
                                        <FileText size={20} />
                                        <span className="text-xs font-medium truncate max-w-[200px]">{file.name}</span>
                                        <X size={14} className="hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); setFile(null); }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-[#5f6368]">
                                        <Upload size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Adjuntar soporte</span>
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
                            className="inline-flex items-center space-x-2 bg-[#1a73e8] text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                            ) : (
                                <ShoppingCart size={18} />
                            )}
                            <span>Confirmar Salida</span>
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};
