import React, { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { fetchCustomerOrders } from '../services/api';
import {
    Package, Truck, CheckCircle, Clock, MapPin,
    ChevronRight, ShoppingBag, X, Printer, Download,
    CreditCard, User as UserIcon, Mail, Calendar, Hash, Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1/public', '');

const OrderDetailModal = ({ order, onClose, statusDetails }) => {
    const ticketRef = useRef();

    if (!order) return null;

    const handlePrint = () => {
        const printContent = ticketRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // To restore state
    };

    const productImageUrl = order.product_image
        ? `${API_BASE_URL}/${order.product_image}`
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100 shadow-sm">
                            <Globe className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">GUSMI<span className="text-primary-600">STORE</span></h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID del Pedido: {order.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {/* Upper Grid: Status & Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Delivery Status */}
                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Truck className="w-5 h-5 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Estado de la Entrega</h3>
                            </div>
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold ${statusDetails.color} mb-4`}>
                                <span className="mr-2">{statusDetails.icon}</span>
                                {statusDetails.label}
                            </div>
                            <p className="text-sm text-gray-600">
                                {order.status === 'PENDING'
                                    ? 'Tu pedido está siendo procesado por nuestro equipo logístico en almacén.'
                                    : order.status === 'COMPLETED'
                                        ? '¡Gran noticia! Tu pedido ha sido confirmado y está listo para ser despachado.'
                                        : 'Tu pedido está en curso hacia la dirección indicada.'}
                            </p>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                    {order.shipping_type === 'PICKUP' ? (
                                        <ShoppingBag className="w-5 h-5 text-primary-600" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900">
                                    {order.shipping_type === 'PICKUP' ? 'Recojo en Tienda' : 'Dirección de Envío'}
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Destino</p>
                                    <p className="text-sm font-bold text-gray-900 leading-snug">
                                        {order.shipping_type === 'PICKUP' ? 'Almacén Central GUSMI' : order.shipping_address}
                                    </p>
                                    {order.shipping_type === 'PICKUP' && (
                                        <p className="text-[10px] text-gray-500 mt-1">Calle Los Pinos 123, San Borja, Lima</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Método</p>
                                    <div className="flex items-center text-xs text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-lg w-fit">
                                        {order.shipping_type === 'PICKUP' ? 'Recojo Presencial' : 'Delivery Local'}
                                    </div>
                                    {order.shipping_type === 'DELIVERY' && (
                                        <p className="text-[10px] text-amber-600 font-black mt-1">Costo de delivery se paga al recibir</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Summary */}
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
                        <div className="p-6 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Resumen del Pedido</h3>
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden shadow-inner">
                                        {productImageUrl ? (
                                            <img src={productImageUrl} alt={order.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.product_name}</p>
                                        <p className="text-sm text-gray-500">Cantidad: {order.quantity} x ${order.unit_price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-gray-900">${(order.quantity * order.unit_price).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/30 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 font-medium">${order.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">IGV (18%)</span>
                                <span className="text-gray-900 font-medium">${order.tax_amount?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Envío</span>
                                <span className={`${order.shipping_type === 'DELIVERY' ? 'text-amber-600 font-bold' : 'text-gray-900 font-medium'}`}>
                                    {order.shipping_type === 'DELIVERY' ? 'Pago contra entrega' : 'Gratis'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-100">
                                <span className="text-lg font-bold text-gray-900">Total Pagado</span>
                                <span className="text-xl font-black text-primary-600">${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sales Ticket (Hidden but printable) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Comprobante de Pago</h3>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center text-xs font-bold text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all border border-primary-100"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir Ticket
                            </button>
                        </div>

                        {/* Printable Ticket Container */}
                        <div ref={ticketRef} className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 max-w-md mx-auto relative overflow-hidden">
                            {/* Tape Decorative elements */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-100/50"></div>

                            {/* Ticket Content */}
                            <div className="text-center space-y-4 font-mono select-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-1">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-black tracking-tighter italic">GUSMI STORE</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gusmi Intelligent Systems S.A.C.</p>
                                    <p className="text-[10px] text-gray-500">RUC: 20123456789</p>
                                    <p className="text-[10px] text-gray-500">Calle Las Casuarinas 123, Lima</p>
                                </div>

                                <div className="border-y border-dashed border-gray-300 py-3 space-y-1">
                                    <p className="text-xs font-bold text-gray-900">TICKET DE VENTA</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Nro: {order.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleString('es-PE')}</p>
                                </div>

                                <div className="text-left space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</p>
                                    <p className="text-xs font-bold text-gray-800">{order.customer_name}</p>
                                    <p className="text-[10px] text-gray-500 italic">{order.customer_email}</p>
                                </div>

                                <div className="border-b border-dashed border-gray-300 pb-3 space-y-3">
                                    <table className="w-full text-left text-[11px]">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-2">ITEM</th>
                                                <th className="py-2 text-center">CANT</th>
                                                <th className="py-2 text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-2 pr-2 leading-tight">{order.product_name}</td>
                                                <td className="py-2 text-center">{order.quantity}</td>
                                                <td className="py-2 text-right">${order.total_amount.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between text-[11px]">
                                        <span>SUBTOTAL:</span>
                                        <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>IGV (18%):</span>
                                        <span>${order.tax_amount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] italic text-gray-400">
                                        <span>ENVÍO:</span>
                                        <span>{order.shipping_type === 'DELIVERY' ? 'PAGO AL RECIBIR' : 'GRATIS'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-2">
                                        <span>TOTAL:</span>
                                        <span>${order.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-6 space-y-2">
                                    <p className="text-[9px] text-gray-400 italic">Gracias por confiar en Gusmi Intelligent Systems. Esta es una representación digital de tu compra.</p>
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg mx-auto flex items-center justify-center border border-gray-100">
                                        <Hash className="w-8 h-8 text-gray-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition shadow-xl shadow-gray-200"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

const Orders = () => {
    const { token, customer, loading: authLoading } = useCustomerAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !token) {
            navigate('/login');
            return;
        }

        if (token) {
            loadOrders();
        }
    }, [token, authLoading]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchCustomerOrders(token);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'En espera de confirmación',
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    icon: <Clock className="w-4 h-4" />,
                    step: 1
                };
            case 'COMPLETED':
                return {
                    label: 'Confirmado por Almacén',
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                    icon: <CheckCircle className="w-4 h-4" />,
                    step: 2
                };
            case 'SENT':
                return {
                    label: 'En Camino',
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    icon: <Truck className="w-4 h-4" />,
                    step: 3
                };
            case 'DELIVERED':
                return {
                    label: 'Entregado',
                    color: 'text-green-600 bg-green-50 border-green-100',
                    icon: <Package className="w-4 h-4" />,
                    step: 4
                };
            default:
                return {
                    label: status,
                    color: 'text-gray-600 bg-gray-50 border-gray-100',
                    icon: <Package className="w-4 h-4" />,
                    step: 1
                };
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Pedidos</h1>
                        <p className="text-gray-500 mt-1">Sigue el estado de tus compras y entregas</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Seguir comprando
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
                        Error al cargar pedidos: {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes pedidos</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Cuando realices una compra, aquí podrás ver el estado y la fecha estimada de entrega.</p>
                        <Link
                            to="/"
                            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                        >
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const status = getStatusDetails(order.status);
                            const productImageUrl = order.product_image
                                ? `${API_BASE_URL}/${order.product_image}`
                                : null;

                            return (
                                <div key={order.id} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform transition hover:scale-[1.01]">
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                                <Package className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedido #{order.id.slice(-6)}</p>
                                                <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center px-4 py-1.5 rounded-full border text-xs font-bold ${status.color}`}>
                                            <span className="mr-2">{status.icon}</span>
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* Order Content */}
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden shadow-inner">
                                                    {productImageUrl ? (
                                                        <img src={productImageUrl} alt={order.product_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{order.product_name}</h3>
                                                    <p className="text-sm text-gray-500">Cantidad: {order.quantity} • Total: ${order.total_amount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Entrega Estimada</p>
                                                    <p className="text-sm font-bold text-primary-600">
                                                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : 'Pendiente'}
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-primary-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tracking Progress */}
                                        <div className="relative pt-4 pb-2 px-2">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                                            <div
                                                className="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 rounded-full transition-all duration-1000"
                                                style={{ width: `${((status.step - 1) / 3) * 100}%` }}
                                            ></div>

                                            <div className="relative flex justify-between">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${status.step >= 1 ? 'bg-primary-600 border-primary-50 text-white' : 'bg-white border-gray-100 text-gray-300'} transition-colors duration-500`}>
                                                        <Clock className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-400 uppercase">Recibido</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${status.step >= 2 ? 'bg-primary-600 border-primary-50 text-white' : 'bg-white border-gray-100 text-gray-300'} transition-colors duration-500`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-400 uppercase">Confirmado</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${status.step >= 3 ? 'bg-primary-600 border-primary-50 text-white' : 'bg-white border-gray-100 text-gray-300'} transition-colors duration-500`}>
                                                        <Truck className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-400 uppercase">En camino</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${status.step >= 4 ? 'bg-primary-600 border-primary-50 text-white' : 'bg-white border-gray-100 text-gray-300'} transition-colors duration-500`}>
                                                        <Package className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-400 uppercase">Entregado</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="bg-gray-50/30 p-4 flex justify-end px-6">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 transition group"
                                        >
                                            Ver detalle del envío
                                            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal rendering */}
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        statusDetails={getStatusDetails(selectedOrder.status)}
                    />
                )}
            </div>
        </div>
    );
};

export default Orders;
