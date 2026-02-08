import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, Package } from 'lucide-react';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const hasRun = React.useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verifyToken = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Token de verificación no encontrado.');
                return;
            }

            try {
                const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const API_URL = RAW_URL.replace(/\/api\/v1\/?$/, '');
                // El backend espera el token como JSON embebido en el body según auth_routes.py
                await axios.post(`${API_URL}/api/v1/auth/verify-email`, { token });
                setStatus('success');
                setMessage('¡Tu cuenta ha sido verificada con éxito!');
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Error al verificar la cuenta. El token puede haber expirado.');
            }
        };

        verifyToken();
    }, [location]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#f8fafc] selection:bg-primary-100 selection:text-primary-900">
            {/* Dynamic Background */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-indigo-200/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-scale-in">
                {/* Branding Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex bg-gradient-to-br from-primary-600 to-indigo-600 p-4 rounded-3xl shadow-xl shadow-primary-500/20 mb-6 active:scale-95 transition-transform">
                        <Package size={42} className="text-white" />
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 text-center">
                    {status === 'verifying' && (
                        <div className="space-y-8">
                            <div className="flex justify-center">
                                <div className="p-6 bg-primary-50 rounded-full animate-bounce">
                                    <Loader2 className="animate-spin text-primary-600" size={48} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-4">Verificando Cuenta</h2>
                                <p className="text-slate-500 font-medium">Por favor, espera un momento mientras validamos tu acceso...</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-center">
                                <div className="bg-emerald-100 p-6 rounded-full">
                                    <CheckCircle className="text-emerald-600" size={64} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">¡Verificado!</h2>
                                <p className="text-slate-600 font-medium">{message}</p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-primary-500/30 active:scale-[0.98]"
                            >
                                <span>Ingresar al Sistema</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-center">
                                <div className="bg-rose-100 p-6 rounded-full">
                                    <XCircle className="text-rose-600" size={64} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">¡Vaya!</h2>
                                <p className="text-slate-600 font-medium">{message}</p>
                            </div>
                            <Link
                                to="/register"
                                className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                            >
                                <span>Reintentar Registro</span>
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    © 2026 Almacenes GUSMI PRO
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
