
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { createOrder } from '../services/api';
import { useCart } from '../context/CartContext';

const OrderConfirmation = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [status, setStatus] = useState('processing'); // processing, success, error
    const [orderData, setOrderData] = useState(null);
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }

        const confirmOrder = async () => {
            try {
                const data = await createOrder(sessionId);
                setOrderData(data);
                setStatus('success');
                setMessage('Thank you for your purchase!');
                clearCart();
            } catch (error) {
                console.error("Order confirmation error:", error);
                setStatus('error');
                setMessage('There was an issue processing your order. Please contact support.');
            }
        };

        confirmOrder();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">

                {status === 'processing' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-blue-600 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Order</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                        <p className="text-gray-500 mb-6">{message}</p>

                        {orderData && (
                            <div className="bg-gray-50 p-4 rounded-lg w-full mb-6 text-left space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">${Number(orderData.total_amount || 0).toFixed(2)}</p>
                                </div>
                                {orderData.delivery_date && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Estimated Delivery Date</p>
                                        <p className="text-lg font-semibold text-primary-600">{new Date(orderData.delivery_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-400">Order IDs: {orderData.order_ids?.join(', ')}</p>
                                    {sessionId?.startsWith('mock_session_') && (
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold rounded">Simulación de Pago</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition w-full flex items-center justify-center"
                        >
                            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Failed</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/cart')}
                            className="bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition w-full"
                        >
                            Return to Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmation;
