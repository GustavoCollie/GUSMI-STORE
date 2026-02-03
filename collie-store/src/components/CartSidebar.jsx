import React from 'react';
import { X, Trash2, Plus, Minus, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const CartSidebar = () => {
    const { cart, isOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={toggleCart}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">

                    <div className="flex items-center justify-between px-4 py-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        <button
                            onClick={toggleCart}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Your cart is empty.</p>
                                <button
                                    onClick={toggleCart}
                                    className="mt-4 text-primary-600 font-medium hover:text-primary-500"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {cart.map((item) => (
                                    <li key={item.id} className="py-6 flex">
                                        <div className={`flex-shrink-0 w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center relative ${item.is_preorder ? 'border-violet-300 ring-2 ring-violet-100' : 'border-gray-200'}`}>
                                            {item.image_path ? (
                                                <img src={getImageUrl(item.image_path)} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            )}
                                            {item.is_preorder && (
                                                <div className="absolute top-1 left-1 bg-violet-600 rounded-full p-0.5">
                                                    <Clock className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>
                                                        {item.name}
                                                        {item.is_preorder && (
                                                            <span className="ml-2 text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Pre-Venta</span>
                                                        )}
                                                    </h3>
                                                    <p className="ml-4">${((item.effective_price || item.retail_price) * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.description?.substring(0, 50)}...</p>
                                            </div>
                                            <div className="flex-1 flex items-end justify-between text-sm">
                                                <div className="flex items-center border rounded-md">
                                                    <button
                                                        className="p-1 hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-2 font-medium">{item.quantity}</span>
                                                    <button
                                                        className="p-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        disabled={!item.is_preorder && item.quantity >= item.stock}
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 py-6 px-4 sm:px-6 bg-gray-50">
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                <p>Subtotal</p>
                                <p>${cartTotal.toFixed(2)}</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                Shipping and taxes calculated at checkout.
                            </p>
                            <button
                                onClick={() => {
                                    toggleCart();
                                    navigate('/checkout');
                                }}
                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Checkout
                            </button>
                            <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                                <p>
                                    or{' '}
                                    <button
                                        type="button"
                                        className="text-primary-600 font-medium hover:text-primary-500"
                                        onClick={toggleCart}
                                    >
                                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartSidebar;
