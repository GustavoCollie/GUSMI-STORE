import React, { useState, useRef } from 'react';
import { X, Upload, FileText, User, Users, Clock, Calendar, Mail, AlertCircle, ShoppingCart } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SellProductModal = ({ product, onClose, onConfirm, loading }) => {
    const [quantity, setQuantity] = useState(1);
    const [reference, setReference] = useState('');
    const [applicant, setApplicant] = useState('');
    const [applicantArea, setApplicantArea] = useState('');
    const [isReturnable, setIsReturnable] = useState(false);
    const [returnDeadline, setReturnDeadline] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (quantity <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }
        if (quantity > product.stock) {
            setError(`Stock insuficiente. Disponible: ${product.stock}`);
            return;
        }
        if (!reference.trim()) {
            setError("La referencia es obligatoria");
            return;
        }
        if (!applicant.trim()) {
            setError("El solicitante es obligatorio");
            return;
        }
        if (!applicantArea.trim()) {
            setError("El área solicitante es obligatoria");
            return;
        }
        if (isReturnable && !returnDeadline) {
            setError("La fecha de retorno es obligatoria para productos devolutivos");
            return;
        }
        if (isReturnable && !recipientEmail.trim()) {
            setError("El email del receptor es obligatorio para productos devolutivos");
            return;
        }
        if (recipientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            setError("El formato del email no es válido");
            return;
        }

        try {
            await onConfirm(product.id, {
                quantity: parseInt(quantity),
                reference,
                applicant,
                applicant_area: applicantArea,
                is_returnable: isReturnable,
                return_deadline: isReturnable ? returnDeadline : null,
                recipient_email: isReturnable && recipientEmail ? recipientEmail : null,
                file
            });
        } catch (err) {
            setError(err.message || "Error al registrar la salida");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in/20">
            <div
                className="bg-white/95 border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-orange-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-600 rounded-xl">
                            <ShoppingCart className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Registrar Salida</h3>
                            <p className="text-xs text-orange-600 font-black uppercase tracking-widest">Salida de Stock de Almacén</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* ... (rest of the content remains the same, but using emerald focus rings) ... */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex justify-between items-center shadow-sm">
                        <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-tight">{product.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    product.stock > 5
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-orange-50 text-orange-600 border-orange-100"
                                )}>
                                    Stock disponible: {product.stock}
                                </span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            {product.sku}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center text-rose-600 text-sm animate-shake">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Referencia / Guía</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                placeholder="GR-2026-001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Solicitante</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={applicant}
                                    onChange={(e) => setApplicant(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                    placeholder="Nombre"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Área / Dept.</label>
                            <div className="relative group">
                                <Users className="absolute left-3 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={applicantArea}
                                    onChange={(e) => setApplicantArea(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                    placeholder="Sistemas"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm",
                                isReturnable
                                    ? "bg-rose-50 border-rose-200"
                                    : "bg-white border-slate-100 hover:bg-slate-50"
                            )}>
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} className={isReturnable ? "text-rose-600" : "text-slate-400"} />
                                    <div className="flex flex-col">
                                        <span className={cn("text-xs font-black uppercase tracking-widest", isReturnable ? "text-rose-900" : "text-slate-600")}>
                                            Devolutivo
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isReturnable}
                                    onChange={(e) => setIsReturnable(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-slate-300 text-rose-600 focus:ring-rose-500 transition-all"
                                />
                            </label>

                            {isReturnable && (
                                <div className="space-y-4 animate-fade-in p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Fecha Retorno</label>
                                        <input
                                            type="date"
                                            value={returnDeadline}
                                            onChange={(e) => setReturnDeadline(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Correo Receptor</label>
                                        <input
                                            type="email"
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                                            placeholder="receptor@empresa.com"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer shadow-sm group",
                                file
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-slate-100 hover:border-orange-300 hover:bg-orange-50"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {file ? (
                                <div className="flex flex-col items-center space-y-2 text-emerald-700">
                                    <FileText size={24} />
                                    <span className="text-[10px] font-bold truncate max-w-[120px]">{file.name}</span>
                                    <X
                                        size={14}
                                        className="text-rose-500 hover:scale-125 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2 text-slate-400 group-hover:text-orange-600 transition-colors">
                                    <Upload size={24} />
                                    <span className="text-xs font-black uppercase tracking-widest">Soporte</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 shadow-lg transition-all active:scale-[0.98]",
                            loading
                                ? "bg-slate-200 text-slate-400 cursor-wait"
                                : "bg-orange-600 hover:bg-orange-500 text-white"
                        )}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white"></div>
                        ) : (
                            <ShoppingCart size={20} />
                        )}
                        <span>Confirmar Salida</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
