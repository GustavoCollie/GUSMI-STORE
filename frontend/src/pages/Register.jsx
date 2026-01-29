import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/v1/auth/register`, {
                email,
                password
            });

            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white overflow-hidden selection:bg-emerald-100">
                <div className="bg-white border-2 border-emerald-100 p-12 rounded-[3.5rem] shadow-2xl shadow-emerald-200/50 w-full max-w-md text-center animate-scale-in">
                    <div className="inline-flex bg-emerald-50 p-6 rounded-3xl mb-8">
                        <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/30">
                            <Package size={54} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">¡Bienvenido!</h2>
                    <p className="text-slate-600 font-medium mb-10 leading-relaxed">
                        Tu cuenta ha sido creada exitosamente. <br />
                        <span className="text-emerald-600 font-black uppercase tracking-widest text-xs">Redirigiendo al sistema...</span>
                    </p>
                    <div className="flex items-center justify-center space-x-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-b-emerald-500"></div>
                        <span>Cargando</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-md animate-scale-in">
                {/* Branding Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 active:scale-95 transition-transform">
                        <Package size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Collie</h1>
                    <p className="text-xs text-indigo-600 font-black uppercase tracking-[0.3em] ml-1">Registro de Almacenes</p>
                </div>

                <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Crear Cuenta</h2>

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
                                Correo Institucional
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="usuario@empresa.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
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
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        minLength={8}
                                        maxLength={72}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-4 pr-14 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                                        placeholder="Confirmar"
                                        required
                                        minLength={8}
                                        maxLength={72}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white"></div>
                                        <span>Procesando...</span>
                                    </div>
                                ) : 'Crear Mi Cuenta'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm font-bold text-slate-500">
                            ¿Ya tienes una cuenta?{' '}
                            <a href="/login" className="text-indigo-600 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] transition-colors">
                                Iniciar sesión
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
