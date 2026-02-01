import React, { useState, useRef } from 'react';
import { X, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ReceiveOrderModal = ({ order, isOpen, onClose, onConfirm, loading }) => {
    const [formData, setFormData] = useState({
        invoice_number: '',
        referral_guide_number: '',
    });
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [referralGuideFile, setReferralGuideFile] = useState(null);
    const [error, setError] = useState(null);

    const invoiceRef = useRef(null);
    const guideRef = useRef(null);

    if (!isOpen || !order) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.invoice_number && !formData.referral_guide_number) {
            setError("Debe ingresar al menos un número de documento (Factura o Guía)");
            return;
        }

        const data = new FormData();
        data.append('status', 'RECEIVED');
        data.append('actual_delivery_date', new Date().toISOString());
        data.append('invoice_number', formData.invoice_number);
        data.append('referral_guide_number', formData.referral_guide_number);
        if (invoiceFile) data.append('invoice_file', invoiceFile);
        if (referralGuideFile) data.append('referral_guide_file', referralGuideFile);

        try {
            await onConfirm(order.id, data);
            onClose();
        } catch (err) {
            setError(err.message || "Error al recibir la orden");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e6f4ea] text-[#1e8e3e] p-2.5 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-[#202124]">Recibir Mercadería</h2>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium tracking-wide">Órden de Compra OC-{order.id.substring(0, 6)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-[#fce8e6] border border-[#f5c2c7] rounded-xl p-4 flex items-center text-[#d93025] text-sm animate-shake">
                            <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Invoice Group */}
                        <div className="space-y-4">
                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Factura de Compra</label>
                                <input
                                    type="text"
                                    placeholder="N° de Factura"
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                    value={formData.invoice_number}
                                    onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                                />
                            </div>
                            <div
                                onClick={() => invoiceRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                                    invoiceFile ? "bg-[#e6f4ea] border-[#1e8e3e]" : "bg-[#f8f9fa] border-[#dadce0] hover:border-[#1a73e8]"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={invoiceRef}
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && setInvoiceFile(e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {invoiceFile ? (
                                    <div className="flex items-center space-x-2 text-[#1e8e3e]">
                                        <FileText size={18} />
                                        <span className="text-[11px] font-medium truncate max-w-[100px]">{invoiceFile.name}</span>
                                        <X size={14} className="cursor-pointer hover:scale-125" onClick={(e) => { e.stopPropagation(); setInvoiceFile(null); }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-[#5f6368]">
                                        <Upload size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Adjuntar Factura</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Referral Guide Group */}
                        <div className="space-y-4">
                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Guía de Remisión</label>
                                <input
                                    type="text"
                                    placeholder="N° de Guía"
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all font-['Outfit']"
                                    value={formData.referral_guide_number}
                                    onChange={e => setFormData({ ...formData, referral_guide_number: e.target.value })}
                                />
                            </div>
                            <div
                                onClick={() => guideRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                                    referralGuideFile ? "bg-[#e6f4ea] border-[#1e8e3e]" : "bg-[#f8f9fa] border-[#dadce0] hover:border-[#1a73e8]"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={guideRef}
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && setReferralGuideFile(e.target.files[0])}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {referralGuideFile ? (
                                    <div className="flex items-center space-x-2 text-[#1e8e3e]">
                                        <FileText size={18} />
                                        <span className="text-[11px] font-medium truncate max-w-[100px]">{referralGuideFile.name}</span>
                                        <X size={14} className="cursor-pointer hover:scale-125" onClick={(e) => { e.stopPropagation(); setReferralGuideFile(null); }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-[#5f6368]">
                                        <Upload size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Adjuntar Guía</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#dadce0] flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center space-x-2 bg-[#1a73e8] text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                            ) : (
                                <CheckCircle size={18} />
                            )}
                            <span>Confirmar Recepción</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
