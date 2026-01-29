import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-md animate-scale-in">
                {/* Branding Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 active:scale-95 transition-transform">
                        <Package size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Collie</h1>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-[0.3em] ml-1">Almacenes de Inventario</p>
                </div>

                <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 flex items-center space-x-3 text-sm animate-shake">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <AlertTriangle size={18} />
                            </div>
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="tu@ejemplo.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 pr-14 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                                    placeholder="••••••••"
                                    required
                                    maxLength={72}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white"></div>
                                        <span>Procesando...</span>
                                    </div>
                                ) : 'Entrar al Sistema'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm font-bold text-slate-500">
                            ¿Aún no tienes acceso?{' '}
                            <a href="/register" className="text-indigo-600 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] transition-colors">
                                Regístrate aquí
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    © 2026 Collie · Almacenes Pro
                </p>
            </div>
        </div>
    );
}
