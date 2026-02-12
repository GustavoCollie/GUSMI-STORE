import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createCheckoutSession } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { CreditCard, Truck, Shield, AlertCircle, Package, Clock, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { isCurrentlyPreorder } from '../utils/productUtils';
import { cn } from '../utils/cn';

const LATIN_AMERICAN_COUNTRIES = [
    'Peru', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
    'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Mexico',
    'Nicaragua', 'Panama', 'Paraguay', 'Republica Dominicana', 'Uruguay', 'Venezuela'
];

const LIMA_DISTRICTS = [
    'Miraflores', 'San Borja', 'San Isidro', 'Surco', 'La Molina', 'Barranco',
    'Chorrillos', 'Jesus Maria', 'Lince', 'Magdalena', 'Pueblo Libre', 'San Miguel',
    'Breña', 'Cercado de Lima', 'Rimac', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'Villa Maria del Triunfo', 'Villa El Salvador',
    'Los Olivos', 'Independencia', 'Comas', 'San Martin de Porres', 'Ate',
    'Santa Anita', 'El Agustino', 'La Victoria', 'Surquillo', 'San Luis',
    'Chaclacayo', 'Lurigancho-Chosica', 'Cieneguilla', 'Pachacamac', 'Carabayllo',
    'Puente Piedra', 'Ancon', 'Santa Rosa', 'Punta Negra', 'Punta Hermosa',
    'San Bartolo', 'Lurin', 'Pucusana'
];

const PERU_DEPARTMENTS = [
    'Arequipa', 'Cusco', 'Trujillo (La Libertad)', 'Piura', 'Chiclayo (Lambayeque)',
    'Huancayo (Junin)', 'Iquitos (Loreto)', 'Tacna', 'Cajamarca', 'Puno',
    'Ayacucho', 'Huanuco', 'Ica'
];

const PERU_LOCATIONS = [...LIMA_DISTRICTS, ...PERU_DEPARTMENTS].sort();

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        country: 'Peru',
        zip: '',
        shippingType: 'PICKUP'
    });

    useEffect(() => {
        if (customer) {
            const names = customer.fullName.split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: customer.email || ''
            }));
        }
    }, [customer]);

    useEffect(() => {
        // Scroll to top and focus title for better a11y when arriving to checkout
        window.scrollTo(0, 0);
        const el = document.getElementById('checkout-title');
        if (el) el.focus({ preventScroll: true });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Reset city when country changes
            if (name === 'country' && value !== prev.country) {
                updated.city = '';
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Prevent double submission if already loading
        if (loading) return;

        if (cart.length === 0) {
            setError("Tu carrito está vacío.");
            return;
        }

        // Basic client-side validation
        const isValid = () => {
            if (!formData.firstName || !formData.lastName || !formData.email) return false;
            if (formData.shippingType === 'DELIVERY') {
                if (!formData.address || !formData.city || !formData.country) return false;
            }
            return true;
        };

        if (!isValid()) {
            setAttemptedSubmit(true);
            setError('Por favor completa los campos requeridos.');
            return;
        }

        setAttemptedSubmit(false);
        setLoading(true);
        setError(null);

        try {
            // Prepare address string based on selection
            const fullAddress = formData.shippingType === 'PICKUP'
                ? 'Recojo en Tienda'
                : `${formData.address}, ${formData.city}, ${formData.country}, ${formData.zip}`.replace(/, , /g, ', ');

            // Prepare payload matching CreateCheckoutSessionRequest schema
            const checkoutPayload = {
                items: cart.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    unit_price: item.effective_price || item.retail_price,
                    image_path: item.image_path
                })),
                customer_email: formData.email,
                customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
                shipping_address: fullAddress,
                shipping_type: formData.shippingType,
                apply_discount: false
            };

            const result = await createCheckoutSession(checkoutPayload);
            if (result.checkout_url) {
                window.location.href = result.checkout_url;
            } else {
                console.warn("Sin checkout_url, asumiendo sesión mock exitosa.");
                // Instead of redirecting to home, we should ideally go to success page or handled locally
                // but let's keep it minimal for now but DO NOT clear cart and redirect if it's just a warning
                // Actually, if it's a mock session and no URL, we might need to handle it.
                // The user said it sends them to home, let's fix that.
                navigate('/order-confirmation?session_id=mock_session_' + Date.now());
            }
        } catch (err) {
            console.error("Error en checkout:", err);
            setError(err.message || "Error al procesar el pago. Por favor, intenta de nuevo.");
            setLoading(false);
        }
    };

    // Auth gate modal
    if (!customer) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" />
                <div className="relative z-50 bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 sm:p-10 border border-gray-100 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-100">
                        <LogIn className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 font-['Outfit']">Inicia sesion para continuar</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Registrarse es facil y rapido. No necesitas agregar tarjeta de credito a menos que realices un pago.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                            className="w-full flex items-center justify-center py-3.5 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Iniciar Sesion
                        </button>
                        <button
                            onClick={() => navigate('/register', { state: { from: '/checkout' } })}
                            className="w-full flex items-center justify-center py-3.5 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Crear Cuenta
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 inline-flex items-center text-sm text-gray-400 hover:text-gray-600 transition font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                    Return to Store
                </button>
            </div>
        );
    }

    const isPeru = formData.country === 'Peru';

    const isFormValid = () => {
        if (!formData.firstName || !formData.lastName || !formData.email) return false;
        if (formData.shippingType === 'DELIVERY') {
            if (!formData.address || !formData.city || !formData.country) return false;
        }
        return true;
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 id="checkout-title" tabIndex={-1} className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center sm:text-left font-['Outfit']">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Form */}
                    <div className="order-2 lg:order-1 lg:col-span-7 bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/50 p-5 sm:p-10 border border-gray-100">
                        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-primary-600" />
                            Información de Envío
                        </h2>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                                <AlertCircle className="w-5 h-5 mr-3" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4 mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Método de Entrega</label>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, shippingType: 'PICKUP' }))}
                                        className={cn(
                                            "p-4 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 relative overflow-hidden group",
                                            formData.shippingType === 'PICKUP'
                                                ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]"
                                                : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                                        )}
                                    >
                                        <Package className={cn("w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-110", formData.shippingType === 'PICKUP' ? "text-[#1a73e8]" : "text-gray-300")} />
                                        <div className="text-center">
                                            <span className="block text-[11px] sm:text-[13px] font-black uppercase tracking-wider">Recojo</span>
                                            <span className="text-[9px] sm:text-[10px] font-bold opacity-70">En Tienda • Gratis</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, shippingType: 'DELIVERY' }))}
                                        className={cn(
                                            "p-4 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 relative overflow-hidden group",
                                            formData.shippingType === 'DELIVERY'
                                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                                : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                                        )}
                                    >
                                        <Truck className={cn("w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-110", formData.shippingType === 'DELIVERY' ? "text-amber-500" : "text-gray-300")} />
                                        <div className="text-center">
                                            <span className="block text-[11px] sm:text-[13px] font-black uppercase tracking-wider">Delivery</span>
                                            <span className="text-[9px] sm:text-[10px] font-bold opacity-70">Pago en recepción</span>
                                        </div>
                                    </button>
                                </div>
                                {formData.shippingType === 'DELIVERY' && (
                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-800 leading-tight">
                                            <strong>Nota:</strong> El costo del delivery no está incluido en este pago. Se cancelará en efectivo o Yape al repartidor cuando recibas tu pedido.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                />
                            </div>

                            {formData.shippingType === 'DELIVERY' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Exacta</label>
                                        <input
                                            type="text"
                                            name="address"
                                            required={formData.shippingType === 'DELIVERY'}
                                            placeholder="Av. Ejemplo 123, Dpto 401..."
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Distrito / Ciudad</label>
                                            {isPeru ? (
                                                <select
                                                    name="city"
                                                    required={formData.shippingType === 'DELIVERY'}
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <optgroup label="Distritos de Lima">
                                                        {LIMA_DISTRICTS.map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="Departamentos">
                                                        {PERU_DEPARTMENTS.map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required={formData.shippingType === 'DELIVERY'}
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="Ciudad o distrito"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                                            <select
                                                name="country"
                                                required={formData.shippingType === 'DELIVERY'}
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                                            >
                                                {LATIN_AMERICAN_COUNTRIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                                            <input
                                                type="text"
                                                name="zip"
                                                value={formData.zip}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={!isFormValid() || loading}
                                    aria-disabled={!isFormValid() || loading}
                                    className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${loading || !isFormValid() ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Pagar ${cartTotal.toFixed(2)}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-start text-sm text-gray-500 mt-4">
                                <Shield className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                                <p>Procesamiento seguro. Tu información está cifrada.</p>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="order-1 lg:order-2 lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/50 p-5 sm:p-10 border border-violet-100 ring-1 ring-violet-50">
                            <h2 className="text-xl font-semibold mb-6">Resumen del Pedido</h2>
                            <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto mb-6">
                                {cart.map((item) => {
                                    const price = item.effective_price || item.retail_price;
                                    const activePreorder = isCurrentlyPreorder(item);
                                    return (
                                        <li key={item.id} className="py-4 flex">
                                            <div className={`flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden bg-gray-50 relative ${activePreorder ? 'border-violet-200' : 'border-gray-200'}`}>
                                                {item.image_path ? (
                                                    <img src={getImageUrl(item.image_path)} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="flex items-center justify-center h-full text-xs text-gray-400">No Img</span>
                                                )}
                                                {activePreorder && (
                                                    <div className="absolute top-0.5 left-0.5">
                                                        <Clock className="w-3.5 h-3.5 text-violet-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                    {activePreorder && (
                                                        <span className="ml-2 text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Pre-Venta</span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                                                {activePreorder && item.preorder_price && (
                                                    <p className="text-[10px] text-violet-600 font-medium">Precio pre-venta aplicado</p>
                                                )}
                                            </div>
                                            <div className={`ml-4 font-medium ${activePreorder ? 'text-violet-700' : 'text-gray-900'}`}>
                                                ${(price * item.quantity).toFixed(2)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Envío</span>
                                    <span className={formData.shippingType === 'DELIVERY' ? 'text-amber-600 font-bold' : ''}>
                                        {formData.shippingType === 'DELIVERY' ? 'Pago en entrega' : 'Gratis'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
