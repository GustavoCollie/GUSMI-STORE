import React from 'react';
import { ArrowUpRight, ArrowDownLeft, FileText, Calendar, Tag, DollarSign, Clock, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MovementTable = ({ movements, loading }) => {
    const generateReceiptPDF = (move) => {
        const doc = new jsPDF();
        const dateStr = new Date(move.date).toLocaleString('es-CL');
        const returnDateStr = move.return_deadline
            ? new Date(move.return_deadline).toLocaleDateString('es-CL')
            : 'N/A';

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('ACTA DE RECEPCIÓN / DESPACHO', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Fecha de Emisión: ${dateStr}`, 105, 28, { align: 'center' });
        doc.line(20, 35, 190, 35);

        // Movement Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DEL MOVIMIENTO', 20, 45);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const moveInfo = [
            ['Tipo de Movimiento:', move.type === 'ENTRY' ? 'ENTRADA (REPOSICIÓN)' : 'SALIDA (DESPACHO)'],
            ['Referencia / Guía:', move.reference],
            ['Cantidad:', `${move.quantity} unidades`],
            ['Solicitante:', move.applicant || 'N/A'],
            ['Área:', move.applicant_area || 'N/A'],
            ['Devolutivo:', move.is_returnable ? 'SÍ' : 'NO'],
            ['Fecha Retorno:', returnDateStr],
            ['Email Receptor:', move.recipient_email || 'N/A']
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Campo', 'Detalle']],
            body: moveInfo,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Signatures
        const finalY = doc.lastAutoTable.finalY + 40;
        doc.line(20, finalY, 80, finalY);
        doc.text('Firma Jefe de Almacén', 50, finalY + 5, { align: 'center' });

        doc.line(130, finalY, 190, finalY);
        doc.text('Firma Receptor', 160, finalY + 5, { align: 'center' });

        doc.save(`acta_${move.reference || move.id}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Historial...</p>
            </div>
        );
    }

    if (movements.length === 0) {
        return (
            <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-slate-200">
                <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Clock size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-600">Sin movimientos</h3>
                <p className="text-slate-400 mt-2">Aún no se han registrado entradas o salidas de productos.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-3xl overflow-hidden animate-fade-in border border-slate-200 bg-white/50 shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tipo</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Referencia</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cantidad</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Solicitante</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Acciones</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {movements.map((move, index) => (
                            <tr
                                key={move.id}
                                className="group hover:bg-slate-50/80 transition-colors"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-xl ${move.type === 'ENTRY'
                                            ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 shadow-sm border border-rose-100'
                                            }`}>
                                            {move.type === 'ENTRY' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black tracking-wider uppercase ${move.type === 'ENTRY' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {move.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                                            </span>
                                            {move.is_returnable && (
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit">
                                                        <ArrowUpRight size={10} className="rotate-45" />
                                                        RETORNABLE
                                                    </span>
                                                    {move.return_deadline && (
                                                        <span className="text-[9px] text-amber-600/80 font-bold uppercase tracking-tight">
                                                            Retorno: {new Date(move.return_deadline).toLocaleDateString('es-CL')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-slate-400 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                                            <Tag size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{move.reference}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                        <span className="text-sm font-black text-slate-900">{move.quantity}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">unidades</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{move.applicant || '—'}</span>
                                        <div className="flex flex-col gap-0.5">
                                            {move.applicant_area && (
                                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{move.applicant_area}</span>
                                            )}
                                            {move.recipient_email && (
                                                <span className="text-[9px] text-primary-600 font-medium">{move.recipient_email}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {move.document_path && (
                                            <a
                                                href={`http://localhost:8000/${move.document_path.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                                                title="Ver Documento"
                                            >
                                                <FileText size={16} />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => generateReceiptPDF(move)}
                                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
                                            title="Generar Acta"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-slate-600">
                                            {new Date(move.date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(move.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
