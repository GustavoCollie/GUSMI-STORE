import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = RAW_URL.replace(/\/api\/v1\/?$/, '');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
                email,
                password
            });

            localStorage.setItem('token', response.data.access_token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa] font-['Outfit']">
            <div className="w-full max-w-[450px] animate-fade-in">
                <div className="bg-white border border-[#dadce0] rounded-[28px] p-10 md:p-12 shadow-sm">
                    {/* Branding Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex text-[#1a73e8] mb-4">
                            <Package size={40} />
                        </div>
                        <h1 className="text-2xl font-medium text-[#202124] tracking-tight mb-2">Iniciar sesión</h1>
                        <p className="text-base text-[#202124]">Usa tu cuenta de Almacenes GUSMI</p>
                    </div>

                    {error && (
                        <div className="bg-[#fce8e6] text-[#d93025] px-4 py-3 rounded-lg mb-6 flex items-center space-x-3 text-sm font-medium">
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all text-[#202124] text-base placeholder:text-[#5f6368]"
                                placeholder="Correo electrónico"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all text-[#202124] text-base placeholder:text-[#5f6368]"
                                    placeholder="Introduce tu contraseña"
                                    required
                                    maxLength={72}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <a href="/register" className="text-[#1a73e8] hover:text-[#174ea6] font-medium text-sm transition-colors">
                                Crear cuenta
                            </a>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1a73e8] text-white px-8 py-2.5 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm"
                            >
                                {loading ? 'Cargando...' : 'Siguiente'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex justify-between items-center mt-6 px-4 text-xs text-[#5f6368]">
                    <span>Español (Latinoamérica)</span>
                    <div className="space-x-4">
                        <a href="#" className="hover:text-[#202124]">Ayuda</a>
                        <a href="#" className="hover:text-[#202124]">Privacidad</a>
                        <a href="#" className="hover:text-[#202124]">Condiciones</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
