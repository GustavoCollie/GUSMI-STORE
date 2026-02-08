import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ShoppingBag, Search, LogOut, Package, Globe, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { toggleCart, cartCount } = useCart();
    const { customer, logout } = useCustomerAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        if (value) {
            navigate(`/?search=${encodeURIComponent(value)}`);
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                                <Globe className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="flex flex-col -space-y-1.5">
                            <span className="text-xl font-black text-slate-900 tracking-tighter">
                                GUSMI<span className="text-primary-600">STORE</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Store</span>
                        </div>
                    </Link>

                    {/* Desktop search */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none bg-gray-50 text-sm"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Desktop auth + cart */}
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center space-x-3 border-r border-gray-100 pr-4">
                            {customer ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                            {customer.fullName.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold">{customer.fullName}</span>
                                    </div>
                                    <Link
                                        to="/orders"
                                        className="text-xs font-bold text-gray-600 hover:text-primary-600 transition flex items-center"
                                    >
                                        <Package className="w-4 h-4 mr-1.5" />
                                        Mis Pedidos
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Cerrar Sesión"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition">
                                        Ingresar
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Cart button — always visible */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-gray-700 hover:text-primary-600 transition bg-gray-50 rounded-full"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-primary-600 rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition rounded-full"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-3 space-y-3">
                    {/* Mobile search */}
                    <div className="relative md:hidden">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchQuery}
                            onChange={(e) => {
                                handleSearchChange(e);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none bg-gray-50 text-sm"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    </div>

                    {/* Mobile auth links */}
                    {customer ? (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                    {customer.fullName.charAt(0)}
                                </div>
                                <span className="text-sm font-bold">{customer.fullName}</span>
                            </div>
                            <Link
                                to="/orders"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                            >
                                <Package className="w-4 h-4" />
                                Mis Pedidos
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex-1 text-center text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-full hover:bg-gray-50 transition"
                            >
                                Ingresar
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileOpen(false)}
                                className="flex-1 text-center text-sm font-bold bg-gray-900 text-white px-4 py-2.5 rounded-full hover:bg-gray-800 transition"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
