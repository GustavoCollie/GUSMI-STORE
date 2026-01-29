import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in/20">
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 overflow-hidden animate-scale-in">
                <div className="p-10">
                    <div className="flex items-center space-x-5 mb-8">
                        <div className="p-4 bg-rose-100 rounded-3xl">
                            <AlertTriangle size={36} className="text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
                            <p className="text-[10px] text-rose-600 font-black uppercase tracking-[0.2em] mt-2">Acción Irreversible</p>
                        </div>
                    </div>

                    <p className="text-slate-600 mb-10 leading-relaxed text-sm font-bold opacity-80">
                        {message}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all border-2 border-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-500 rounded-2xl shadow-xl shadow-rose-500/20 transition-all active:scale-95"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
