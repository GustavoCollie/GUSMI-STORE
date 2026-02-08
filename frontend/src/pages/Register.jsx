import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = RAW_URL.replace(/\/api\/v1\/?$/, '');

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
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa] font-['Outfit']">
                <div className="bg-white border border-[#dadce0] rounded-[28px] p-10 md:p-12 shadow-sm w-full max-w-[450px] text-center animate-fade-in">
                    <div className="inline-flex text-[#1e8e3e] mb-6">
                        <Package size={48} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#202124] mb-4">¡Todo listo!</h2>
                    <p className="text-[#5f6368] mb-10">
                        Tu cuenta de GUSMI ha sido creada. Ahora puedes gestionar tus almacenes con el mejor estilo Google.
                    </p>
                    <div className="flex items-center justify-center space-x-3 text-[#1e8e3e] font-medium">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#e8f5e9] border-b-[#1e8e3e]"></div>
                        <span>Cargando sistema...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa] font-['Outfit']">
            <div className="w-full max-w-[450px] animate-fade-in">
                <div className="bg-white border border-[#dadce0] rounded-[28px] p-10 md:p-12 shadow-sm">
                    {/* Branding Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex text-[#1a73e8] mb-4">
                            <Package size={40} />
                        </div>
                        <h1 className="text-2xl font-medium text-[#202124] tracking-tight mb-2">Crear tu cuenta</h1>
                        <p className="text-base text-[#202124]">Únete a Almacenes GUSMI</p>
                    </div>

                    {error && (
                        <div className="bg-[#fce8e6] text-[#d93025] px-4 py-3 rounded-lg mb-6 flex items-center space-x-3 text-sm font-medium">
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all text-[#202124] text-base placeholder:text-[#5f6368]"
                                placeholder="Correo institucional"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all text-[#202124] text-base placeholder:text-[#5f6368]"
                                    placeholder="Contraseña"
                                    required
                                    minLength={8}
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

                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all text-[#202124] text-base placeholder:text-[#5f6368]"
                                    placeholder="Confirmar contraseña"
                                    required
                                    minLength={8}
                                    maxLength={72}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6">
                            <a href="/login" className="text-[#1a73e8] hover:text-[#174ea6] font-medium text-sm transition-colors">
                                Iniciar sesión en su lugar
                            </a>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1a73e8] text-white px-8 py-2.5 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm"
                            >
                                {loading ? 'Creando...' : 'Registrar'}
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
