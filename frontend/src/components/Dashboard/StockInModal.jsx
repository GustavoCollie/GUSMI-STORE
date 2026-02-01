import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Plus, AlertCircle, RefreshCw, User, Calendar, Mail } from 'lucide-react';
import { cn } from '../../utils/cn';
import { inventoryService } from '../../services/api';

export const StockInModal = ({ product, onClose, onConfirm, loading }) => {
    const [quantity, setQuantity] = useState(1);
    const [reference, setReference] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [pendingReturns, setPendingReturns] = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [loadingReturns, setLoadingReturns] = useState(false);
    const fileInputRef = useRef(null);

    if (!product) return null;

    useEffect(() => {
        const fetchPendingReturns = async () => {
            setLoadingReturns(true);
            try {
                const response = await inventoryService.getPendingReturns(product.id);
                setPendingReturns(response.data);
            } catch (err) {
                console.error("Error fetching pending returns:", err);
            } finally {
                setLoadingReturns(false);
            }
        };

        fetchPendingReturns();
    }, [product.id]);

    const handleReturnSelect = (e) => {
        const movementId = e.target.value;
        if (!movementId) {
            setSelectedReturn(null);
            setQuantity(1);
            setReference('');
            return;
        }

        const selected = pendingReturns.find(r => r.movement_id === movementId);
        setSelectedReturn(selected);
        if (selected) {
            setQuantity(selected.pending_quantity);
            setReference(`Retorno: ${selected.reference}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (quantity <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }

        if (selectedReturn && quantity > selectedReturn.pending_quantity) {
            setError(`La cantidad no puede exceder lo pendiente (${selectedReturn.pending_quantity})`);
            return;
        }

        try {
            await onConfirm(product.id, {
                quantity: parseInt(quantity),
                reference: reference || 'S/N',
                file,
                parent_id: selectedReturn?.movement_id
            });
        } catch (err) {
            setError(err.message || "Error al añadir stock");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#e8f0fe] text-[#1a73e8] p-2.5 rounded-lg">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-[#202124]">Confirmar Retorno</h3>
                            <p className="text-xs text-[#5f6368] mt-0.5 font-medium">Gestión de productos devueltos o retornos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#ecedef] rounded-full transition-colors">
                        <X size={20} className="text-[#5f6368]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Item Context */}
                    <div className="p-4 bg-[#f1f3f4] rounded-xl border border-[#dadce0] flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">PRODUCTO</span>
                            <h4 className="text-sm font-medium text-[#202124]">{product.name}</h4>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">STOCK ACTUAL</span>
                            <p className="text-sm font-medium text-[#1a73e8]">{product.stock} uds</p>
                        </div>
                    </div>

                    {/* Pending Returns Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[13px] font-medium text-[#202124] ml-1 flex items-center">
                                <RefreshCw size={14} className="mr-1.5 text-[#1a73e8]" />
                                Vincular a Consumo Pendiente
                            </label>
                            {loadingReturns && <span className="text-xs text-[#5f6368]">Cargando...</span>}
                        </div>

                        {pendingReturns.length > 0 ? (
                            <>
                                <select
                                    onChange={handleReturnSelect}
                                    className="w-full bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all appearance-none cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="">-- Seleccionar Devolución (Opcional) --</option>
                                    {pendingReturns.map((ret) => (
                                        <option key={ret.movement_id} value={ret.movement_id}>
                                            {ret.applicant} ({ret.applicant_area}) - Pendiente: {ret.pending_quantity} uds
                                        </option>
                                    ))}
                                </select>

                                {selectedReturn && (
                                    <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed] space-y-2 text-xs text-[#5f6368] animate-fade-in">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                <User size={12} className="mr-1.5 text-[#1a73e8]" />
                                                <span className="text-[#202124] font-medium">{selectedReturn.applicant}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-1.5 text-[#1a73e8]" />
                                                <span>{new Date(selectedReturn.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {selectedReturn.recipient_email && (
                                            <div className="flex items-center border-t border-[#e8eaed] pt-2 mt-1">
                                                <Mail size={12} className="mr-1.5 text-[#1a73e8]" />
                                                <span className="truncate">{selectedReturn.recipient_email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            !loadingReturns && (
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-center">
                                    <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                                    No hay consumos internos pendientes de devolución para este producto.
                                </div>
                            )
                        )}
                    </div>

                    {error && (
                        <div className="bg-[#fce8e6] border border-[#f5c2c7] rounded-xl p-4 flex items-center text-[#d93025] text-sm animate-shake">
                            <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Cantidad a ingresar</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedReturn ? selectedReturn.pending_quantity : undefined}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                placeholder="0"
                            />
                            {selectedReturn && (
                                <p className="text-xs text-[#5f6368] ml-1">Máximo: {selectedReturn.pending_quantity} uds</p>
                            )}
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Referencia / Guía (Opcional)</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all"
                                placeholder="Ej: GR-2026-X"
                            />
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Documento comprobante</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                                    file ? "bg-[#e6f4ea] border-[#1e8e3e]" : "bg-[#f8f9fa] border-[#dadce0] hover:border-[#1a73e8]"
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
                                    <div className="flex items-center space-x-2 text-[#1e8e3e]">
                                        <FileText size={20} />
                                        <span className="text-xs font-medium truncate max-w-[200px]">{file.name}</span>
                                        <X size={14} className="hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); setFile(null); }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-[#5f6368]">
                                        <Upload size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Adjuntar archivo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
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
                                <Plus size={18} />
                            )}
                            <span>Confirmar Entrada</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
