import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/api';
import { ShoppingBag, SearchX, Clock, Timer, ShoppingCart, TrendingDown, FileText, X, Ship, Shield, CalendarClock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { cn } from '../utils/cn';
import { getImageUrl } from '../utils/imageUtils';
import { isCurrentlyPreorder, getActivePrice } from '../utils/productUtils';

import { Hero } from '../components/Hero';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNoSheetModal, setShowNoSheetModal] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();

    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery) ||
        (product.description && product.description.toLowerCase().includes(searchQuery))
    );

    const regularProducts = filteredProducts.filter(p => !isCurrentlyPreorder(p));
    const preorderProducts = filteredProducts.filter(p => isCurrentlyPreorder(p));

    const getCountdown = (dateStr) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr) - new Date();
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    };

    const canAdd = (product) => isCurrentlyPreorder(product) || product.stock > 0;

    const getDiscountPercent = (product) => {
        if (!isCurrentlyPreorder(product) || !product.preorder_price || !product.retail_price) return null;
        const retail = parseFloat(product.retail_price);
        const preorder = parseFloat(product.preorder_price);
        if (retail <= 0 || preorder >= retail) return null;
        return Math.round(((retail - preorder) / retail) * 100);
    };

    const handleTechSheet = (e, product) => {
        e.stopPropagation();
        if (product.tech_sheet_path) {
            window.open(getImageUrl(product.tech_sheet_path), '_blank');
        } else {
            setShowNoSheetModal(true);
        }
    };

    const renderProductCard = (product) => {
        const discount = getDiscountPercent(product);
        const activePreorder = isCurrentlyPreorder(product);

        return (
            <div
                key={product.id}
                className={cn(
                    "bg-white rounded-2xl shadow-sm overflow-hidden border transition-all duration-500 cursor-pointer group relative flex flex-col h-full",
                    activePreorder
                        ? "border-accent-400 ring-2 ring-accent-100/50 hover:shadow-xl hover:shadow-accent-200/50 hover:-translate-y-1 bg-gradient-to-b from-accent-50/50 to-white"
                        : "border-gray-100 hover:shadow-lg hover:-translate-y-1"
                )}
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {/* Visual Label for Pre-order */}
                {activePreorder && (
                    <div className="absolute top-0 left-0 z-20 overflow-hidden w-32 h-32 pointer-events-none">
                        <div className="absolute top-[18px] left-[-35px] w-[170px] text-center transform -rotate-45 bg-accent-600 text-white text-[9px] font-black uppercase tracking-[2px] py-1.5 shadow-lg flex items-center justify-center gap-1.5 ring-1 ring-white/20">
                            <Clock size={10} strokeWidth={3} />
                            PRE-VENTA
                        </div>
                    </div>
                )}

                {/* Image Section */}
                <div className={cn(
                    "h-52 flex items-center justify-center relative overflow-hidden transition-colors duration-500",
                    activePreorder ? "bg-accent-50/30" : "bg-gray-50"
                )}>
                    {product.image_path ? (
                        <img
                            src={getImageUrl(product.image_path)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                        />
                    ) : (
                        <ShoppingBag className="w-14 h-14 text-gray-200 group-hover:scale-110 transition duration-500" />
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {activePreorder && discount && (
                            <span className="bg-gradient-to-br from-[#f59e0b] to-[#ea580c] text-white px-3 py-1.5 rounded-xl text-sm font-black shadow-xl shadow-orange-200 flex items-center gap-1.5 animate-pulse">
                                <TrendingDown size={14} strokeWidth={3} />
                                -{discount}%
                            </span>
                        )}

                        {!activePreorder && product.stock > 0 && (
                            <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm",
                                product.stock < 5 ? "bg-orange-500 text-white" : "bg-emerald-600 text-white"
                            )}>
                                {product.stock < 5 ? `¡Casi Agotado! (${product.stock})` : `En Stock (${product.stock})`}
                            </span>
                        )}
                    </div>

                    {/* Footer Info on Image */}
                    {activePreorder && product.estimated_delivery_date && (
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                            <span className="bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 border border-white/10 shadow-lg">
                                <Timer className="w-4 h-4 text-accent-300" />
                                <span className="uppercase tracking-widest text-accent-100">Llega en:</span>
                                <span className="text-white">{getCountdown(product.estimated_delivery_date) || 'Pronto'}</span>
                            </span>
                        </div>
                    )}

                    {!activePreorder && product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white/90 text-gray-900 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl">Agotado</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-auto">
                        <h3 className="font-bold text-gray-900 mb-2 truncate font-['Outfit'] text-[16px] group-hover:text-primary-700 transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-gray-500 text-[12px] mb-4 line-clamp-2 h-9 leading-relaxed font-medium">
                            {activePreorder && product.preorder_description ? product.preorder_description : (product.description || 'Sin descripción disponible')}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                            {activePreorder && product.preorder_price ? (
                                <>
                                    <span className="text-[10px] text-accent-600 font-extrabold uppercase tracking-[1.5px] mb-1">Precio Especial</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-black text-accent-600 text-2xl leading-none font-['Outfit']">
                                            ${product.preorder_price}
                                        </span>
                                        <span className="text-gray-400 text-sm line-through decoration-red-500/50 font-bold">
                                            ${product.retail_price}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Precio Online</span>
                                    <span className="font-black text-gray-900 text-2xl leading-none font-['Outfit']">
                                        ${product.retail_price}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <button
                                disabled={!canAdd(product)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product);
                                }}
                                className={cn(
                                    "h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2",
                                    !canAdd(product)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : activePreorder
                                            ? "bg-accent-500 text-white hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-200"
                                            : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-200"
                                )}
                            >
                                <ShoppingCart size={14} />
                                {activePreorder ? 'Reservar' : (product.stock > 0 ? 'Comprar' : 'Agotado')}
                            </button>
                            <button
                                onClick={(e) => handleTechSheet(e, product)}
                                className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-1.5"
                            >
                                <FileText size={12} />
                                Ficha Técnica
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <Hero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight">
                            {searchQuery ? `Resultados para "${searchQuery}"` : "Nuestros Productos"}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {searchQuery
                                ? `${filteredProducts.length} productos encontrados`
                                : "Calidad garantizada en cada detalle"
                            }
                        </p>
                    </div>
                    <div className="h-0.5 flex-1 bg-gray-100 mx-8 hidden md:block" />
                </div>

                {loading ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Cargando productos...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12">{error}</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 font-['Outfit']">No encontramos lo que buscas</h3>
                        <p className="text-gray-500 mt-2">Intenta con otros términos o explora nuestra colección completa.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 text-primary-600 font-bold hover:underline"
                        >
                            Ver todos los productos
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Regular Products */}
                        {regularProducts.length > 0 && (
                            <div id="productos-stock">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 font-['Outfit']">Productos Disponibles</h3>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{regularProducts.length}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {regularProducts.map(renderProductCard)}
                                </div>
                            </div>
                        )}

                        {/* Decorative Banner between sections */}
                        {regularProducts.length > 0 && preorderProducts.length > 0 && (
                            <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-primary-200/50 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl md:text-3xl font-black font-['Outfit'] text-center mb-2">
                                        ¿Cómo funciona?
                                    </h3>
                                    <p className="text-primary-200 text-center text-sm mb-8 max-w-xl mx-auto">
                                        Importamos directamente de fábrica para ofrecerte los mejores precios en sistemas de riego
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Ship className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-lg mb-2 font-['Outfit']">Importación Directa</h4>
                                            <p className="text-primary-200 text-sm leading-relaxed">
                                                Traemos los productos directo de fábrica, sin intermediarios, para garantizar el mejor precio.
                                            </p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-lg mb-2 font-['Outfit']">Pre-Venta a Precio Especial</h4>
                                            <p className="text-primary-200 text-sm leading-relaxed">
                                                Reserva antes de que llegue el producto y obtén un descuento exclusivo sobre el precio regular.
                                            </p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <CalendarClock className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-lg mb-2 font-['Outfit']">Entrega en Fecha Estimada</h4>
                                            <p className="text-primary-200 text-sm leading-relaxed">
                                                Te entregamos el producto en la fecha estimada. Recibirás actualizaciones del estado de tu pedido.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preorder Products */}
                        {preorderProducts.length > 0 && (
                            <div id="productos-preventa">
                                <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-primary-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2.5 rounded-xl">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold font-['Outfit']">Pre-Venta</h3>
                                            <p className="text-primary-200 text-sm">Reserva ahora a precio especial — entrega cuando llegue el producto</p>
                                        </div>
                                        <span className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full font-bold">{preorderProducts.length} {preorderProducts.length === 1 ? 'producto' : 'productos'}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {preorderProducts.map(renderProductCard)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Sin Ficha Técnica */}
            {showNoSheetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowNoSheetModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowNoSheetModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-center">
                            <div className="bg-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 font-['Outfit'] mb-2">Ficha Técnica No Disponible</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Este producto aún no cuenta con ficha técnica disponible. Contáctanos para más información.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
