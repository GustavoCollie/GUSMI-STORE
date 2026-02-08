import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Clock, Timer, ShoppingCart, TrendingDown, Package } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { cn } from '../utils/cn';
import { isCurrentlyPreorder, getActivePrice } from '../utils/productUtils';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (err) {
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
            <p className="mb-4">{error}</p>
            <button onClick={() => navigate('/')} className="text-primary-600 hover:underline flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
            </button>
        </div>
    );
    if (!product) return null;
    const activePreorder = isCurrentlyPreorder(product);

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-all font-semibold text-sm group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver a la Tienda
                </button>

                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col md:grid md:grid-cols-12 gap-0 min-h-[600px]">

                    {/* Image Section */}
                    <div className={cn(
                        "md:col-span-6 p-8 md:p-12 flex items-center justify-center relative transition-colors duration-700",
                        activePreorder ? "bg-violet-50/50" : "bg-gray-50"
                    )}>
                        <div className="relative group/img">
                            {product.image_path ? (
                                <img
                                    src={getImageUrl(product.image_path)}
                                    alt={product.name}
                                    className="max-w-full max-h-[500px] object-contain rounded-3xl shadow-2xl shadow-black/5 group-hover/img:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="text-gray-200 p-12 bg-white rounded-full shadow-inner">
                                    <ShoppingBag className="w-32 h-32" />
                                </div>
                            )}

                            {activePreorder && (
                                <div className="absolute -top-4 -left-4 rotate-[-12deg] z-10">
                                    <div className="bg-[#7c3aed] text-white px-6 py-3 rounded-2xl text-base font-black flex items-center gap-3 shadow-[0_10px_30px_-5px_rgba(124,58,237,0.5)] ring-4 ring-white">
                                        <TrendingDown className="w-6 h-6" strokeWidth={3} />
                                        OFERTA EXCLUSIVA
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Badges on Desktop */}
                        <div className="absolute top-8 right-8 flex flex-col gap-3">
                            {activePreorder && (
                                <div className="bg-white/80 backdrop-blur-md border border-violet-200 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                                    <Clock className="w-4 h-4 text-violet-600" />
                                    <span className="text-[11px] font-black text-violet-700 uppercase tracking-widest">Pre-Venta Activa</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="md:col-span-6 p-8 md:p-16 flex flex-col justify-center bg-white border-l border-gray-50">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                {activePreorder && (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-violet-100 text-violet-700 uppercase tracking-[2px] border border-violet-200">
                                        Lanzamiento Especial
                                    </span>
                                )}
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-['Outfit'] tracking-tight leading-tight">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center gap-6">
                                    {activePreorder && product.preorder_price ? (
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-5xl font-black text-[#7c3aed] font-['Outfit']">${product.preorder_price}</span>
                                                <span className="text-2xl text-gray-300 line-through decoration-red-500/30 font-bold">${product.retail_price}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">Ahorras {Math.round(((product.retail_price - product.preorder_price) / product.retail_price) * 100)}%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-5xl font-black text-gray-900 font-['Outfit']">${product.retail_price}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {activePreorder ? (
                                        product.estimated_delivery_date && (
                                            <div className="flex items-center gap-2 text-sm font-bold bg-amber-50 text-amber-700 px-4 py-2.5 rounded-2xl border border-amber-100">
                                                <Timer className="w-5 h-5" />
                                                <span>Llega el {new Date(product.estimated_delivery_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</span>
                                            </div>
                                        )
                                    ) : (
                                        <div className={cn(
                                            "flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl border",
                                            product.stock > 0
                                                ? product.stock < 5 ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            <Package className="w-5 h-5" />
                                            <span>{product.stock > 0 ? (product.stock < 5 ? `¡Casi agotado! Quedan ${product.stock}` : `En stock: ${product.stock} unidades`) : "Agotado"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {activePreorder && product.preorder_description && (
                                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-5 h-5 text-violet-200" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-200">Garantía de Reserva</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic opacity-95">"{product.preorder_description}"</p>
                                </div>
                            )}

                            <p className="text-gray-500 text-base leading-relaxed font-medium">
                                {product.description || "Este producto aún no cuenta con una descripción detallada. Contáctanos para recibir más especificaciones técnicas."}
                            </p>

                            <div className="pt-8 space-y-4">
                                <button
                                    disabled={!activePreorder && product.stock <= 0}
                                    onClick={() => addToCart(product)}
                                    className={cn(
                                        "w-full h-16 rounded-[1.25rem] font-black uppercase tracking-[2px] flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl active:scale-95",
                                        activePreorder
                                            ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-violet-300 ring-4 ring-violet-50"
                                            : product.stock > 0
                                                ? "bg-gray-900 text-white hover:bg-black shadow-gray-300 ring-4 ring-gray-50"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    )}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {activePreorder ? "Asegurar mi Reserva" : (product.stock > 0 ? "Agregar al Carrito" : "Agotado")}
                                </button>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-500">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Envío Seguro</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white p-2 rounded-xl shadow-sm text-blue-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Garantía Oficial</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
