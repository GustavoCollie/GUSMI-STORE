import React, { useState, useRef } from 'react';
import { X, Package, AlertCircle, FileText, Upload, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProductForm = ({ onSubmit, onClose, initialData, inline = false }) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        sku: initialData?.sku || '',
        retail_price: initialData?.retail_price || '',
        stripe_price_id: initialData?.stripe_price_id || '',
        is_preorder: initialData?.is_preorder || false,
        preorder_price: initialData?.preorder_price || '',
        estimated_delivery_date: initialData?.estimated_delivery_date ? new Date(initialData.estimated_delivery_date).toISOString().split('T')[0] : '',
        preorder_description: initialData?.preorder_description || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [techSheetFile, setTechSheetFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const imageInputRef = useRef(null);
    const techSheetInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = {
                ...formData
            };

            if (imageFile) data.image_file = imageFile;
            if (techSheetFile) data.tech_sheet_file = techSheetFile;

            await onSubmit(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const headerContent = (
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#dadce0]">
            <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#e8f0fe] text-[#1a73e8] rounded-lg">
                    <Package size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-[#202124]">
                        {isEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                    </h3>
                    <p className="text-xs text-[#5f6368] mt-0.5 font-['Outfit']">
                        {isEdit ? 'Actualiza los detalles técnicos' : 'El stock inicial será 0 por defecto'}
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full transition-all"
            >
                <X size={20} />
            </button>
        </div>
    );

    const formBody = (
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                    {error && (
                        <div className="bg-[#fce8e6] border border-[#f5c2c7] text-[#d93025] p-4 rounded-xl text-sm flex items-center space-x-3 animate-shake">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left: General Info */}
                            <div className="space-y-5">
                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="google-input"
                                        placeholder="Ej: Monitor LED 24\"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">SKU / Código</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="google-input uppercase font-mono"
                                        placeholder="SKU-001"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Precio de Venta (S/)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.retail_price}
                                        onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                                        className="google-input font-mono"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-1.5 font-['Outfit']">
                                    <label className="text-[13px] font-medium text-[#202124] ml-1">Stripe Price ID (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.stripe_price_id}
                                        onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                                        className="google-input font-mono"
                                        placeholder="price_..."
                                    />
                                </div>
                            </div>

                            {/* Right: Product Photo */}
                            <div className="space-y-1.5 font-['Outfit']">
                                <label className="text-[13px] font-medium text-[#202124] ml-1">Foto del Producto</label>
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-[#f8f9fa]",
                                        imagePreview ? "border-solid border-[#1a73e8]" : "border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/50"
                                    )}
                                >
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-[#5f6368]">
                                            <Upload size={24} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Subir Foto</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 font-['Outfit']">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="google-input resize-none"
                                placeholder="Especificaciones técnicas, marca, modelo..."
                                rows="3"
                                required
                            />
                        </div>

                        {/* Pre-order Section */}
                        <div className="space-y-4 pt-4 border-t border-[#dadce0]">
                            <div className="flex items-center justify-between p-4 bg-[#fef7e0] rounded-xl border border-[#f9ab00]/20">
                                <div className="flex items-center space-x-3">
                                    <Package size={20} className={formData.is_preorder ? "text-[#f9ab00]" : "text-[#5f6368]"} />
                                    <div>
                                        <h4 className="text-sm font-medium text-[#202124]">Modo Preventa</h4>
                                        <p className="text-[11px] text-[#5f6368]">Producto importado sin stock físico</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.is_preorder}
                                    onChange={(e) => setFormData({ ...formData, is_preorder: e.target.checked })}
                                    className="w-5 h-5 accent-[#f9ab00] cursor-pointer"
                                />
                            </div>

                            {formData.is_preorder && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 font-['Outfit']">
                                            <label className="text-[13px] font-medium text-[#f9ab00] ml-1">Precio de Preventa (S/)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.preorder_price}
                                                onChange={(e) => setFormData({ ...formData, preorder_price: e.target.value })}
                                                className="google-input font-mono"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="space-y-1.5 font-['Outfit']">
                                            <label className="text-[13px] font-medium text-[#f9ab00] ml-1">Fecha Estimada de Llegada</label>
                                            <input
                                                type="date"
                                                value={formData.estimated_delivery_date}
                                                onChange={(e) => setFormData({ ...formData, estimated_delivery_date: e.target.value })}
                                                className="google-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 font-['Outfit']">
                                        <label className="text-[13px] font-medium text-[#f9ab00] ml-1">Descripción de Preventa</label>
                                        <textarea
                                            value={formData.preorder_description}
                                            onChange={(e) => setFormData({ ...formData, preorder_description: e.target.value })}
                                            className="google-input resize-none"
                                            placeholder="Ej: Próximo arribo desde China - Marzo 2026"
                                            rows="2"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tech Sheet Upload */}
                        <div className="space-y-1.5 font-['Outfit'] pt-2">
                            <label className="text-[13px] font-medium text-[#202124] ml-1">Ficha Técnica (.pdf, .doc)</label>
                            <div
                                onClick={() => techSheetInputRef.current?.click()}
                                className={cn(
                                    "flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-[#f8f9fa]",
                                    techSheetFile ? "bg-[#e8f0fe] border-[#1a73e8]" : "border-[#dadce0] hover:border-[#1a73e8]"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={techSheetInputRef}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setTechSheetFile(e.target.files[0])}
                                />
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    techSheetFile ? "bg-[#1a73e8] text-white" : "bg-[#dadce0] text-[#5f6368]"
                                )}>
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-medium text-[#202124] truncate px-1">
                                        {techSheetFile ? techSheetFile.name : 'Seleccionar Ficha Técnica'}
                                    </p>
                                    {!techSheetFile && <p className="text-[10px] text-[#5f6368] px-1 uppercase tracking-tight">Opcional</p>}
                                </div>
                                {techSheetFile && (
                                    <button
                                        type="button"
                                        className="text-[#5f6368] hover:text-[#d93025]"
                                        onClick={(e) => { e.stopPropagation(); setTechSheetFile(null); }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#dadce0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-all font-['Outfit']"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center space-x-2 bg-[#1a73e8] text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-[#1765cc] transition-all shadow-md active:scale-95 disabled:opacity-50 font-['Outfit']"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                            ) : (
                                <Plus size={18} />
                            )}
                            <span>{isEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
                        </button>
                    </div>
                </form>
    );

    if (inline) {
        return (
            <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                {headerContent}
                {formBody}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-[2px] animate-fade-in">
            <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {headerContent}
                {formBody}
            </div>
        </div>
    );
};

