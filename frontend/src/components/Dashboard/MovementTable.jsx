import React from 'react';
import { ArrowUpRight, ArrowDownLeft, FileText, Tag, Printer, Box, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const MovementTable = ({ movements, loading }) => {
    const [activeSubTab, setActiveSubTab] = React.useState('internal_entries'); // 'internal_entries' or 'sales'

    const getMovementLabel = (move) => {
        if (move.type === 'VENTA' || !!move.sales_order_id) return 'Venta';

        const labels = {
            'INGRESO': 'Ingreso',
            'ENTRY': 'Ingreso',
            'CONSUMO INTERNO': 'Consumo Interno',
            'EXIT': 'Consumo Interno',
            'RETURN': 'Retorno'
        };
        return labels[move.type] || (move.type || '').replace('_', ' ');
    };

    const generateReceiptPDF = (move) => {
        const doc = new jsPDF();
        const dateStr = new Date(move.date).toLocaleString('es-CL');

        doc.setFontSize(22);
        doc.setTextColor(26, 115, 232); // Google Blue
        doc.text('Comprobante de Almacén', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(95, 99, 104);
        doc.text(`GUSMI Inventarios Intelligent System • ${dateStr}`, 105, 32, { align: 'center' });
        doc.line(20, 40, 190, 40);

        autoTable(doc, {
            startY: 50,
            head: [['Detalle del Movimiento', 'Información']],
            body: [
                ['Tipo:', getMovementLabel(move)],
                ['Producto:', move.product_name || 'N/A'],
                ['Referencia:', move.reference],
                ['Cantidad:', `${move.quantity} unidades`],
                [(move.type === 'VENTA' || !!move.sales_order_id) ? 'Cliente:' : 'Responsable:', move.applicant || 'N/A'],
                ['Área:', move.applicant_area || 'N/A'],
                ['Retornable:', move.is_returnable ? 'SÍ' : 'NO'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [26, 115, 232] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        doc.save(`acta_${move.reference || move.id}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a73e8] border-b-transparent"></div>
            </div>
        );
    }

    const filteredMovements = (movements || []).filter(m => {
        const isSale = m.type === 'VENTA' || !!m.sales_order_id;
        if (activeSubTab === 'sales') {
            return isSale;
        } else {
            return !isSale;
        }
    });

    const handleExportExcel = () => {
        const title = "Historial de Movimientos";
        const description = "Trazabilidad completa de entradas y salidas de almacén";
        const subtitle = activeSubTab === 'sales' ? "SALIDAS DE VENTAS" : "INGRESOS Y CONSUMO INTERNO";

        // Define Headers based on tab
        const headers = activeSubTab === 'sales'
            ? ['Tipo', 'Producto', 'Referencia', 'Cantidad', 'Cliente', 'Fecha', 'Hora']
            : ['Tipo', 'Producto', 'Referencia', 'Cantidad', 'Responsable', 'Área', 'Retornable', 'Fecha Retorno', 'Fecha', 'Hora'];

        // Map data rows
        const dataRows = filteredMovements.map(m => {
            const common = [
                getMovementLabel(m),
                m.product_name || '—',
                m.reference,
                m.quantity,
            ];

            const date = new Date(m.date);
            const dateStr = date.toLocaleDateString('es-CL');
            const timeStr = date.toLocaleTimeString('es-CL');

            const returnDeadlineStr = m.return_deadline
                ? new Date(m.return_deadline).toLocaleDateString('es-CL')
                : '—';

            if (activeSubTab === 'sales') {
                return [...common, m.applicant || '—', dateStr, timeStr];
            } else {
                return [
                    ...common,
                    m.applicant || '—',
                    m.applicant_area || '—',
                    m.is_returnable ? 'SÍ' : 'NO',
                    returnDeadlineStr,
                    dateStr,
                    timeStr
                ];
            }
        });

        // Create Worksheet using Array of Arrays
        // Row 1: Title
        // Row 2: Description
        // Row 3: Subtitle
        // Row 4: Empty
        // Row 5: Headers
        // Row 6+: Data
        const wsData = [
            [title],
            [description],
            [subtitle],
            [], // Empty row
            headers,
            ...dataRows
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Merge cells for Title, Description, and Subtitle
        // s: start, e: end, r: row, c: col
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }); // Title
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }); // Description
        ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }); // Subtitle

        // Basic Column Widths (autosize approximation)
        const wscols = headers.map(() => ({ wch: 20 }));
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

        const filename = `Movimientos_${subtitle.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const getStatusStyle = (move) => {
        if (move.type === 'VENTA' || !!move.sales_order_id) return 'bg-[#e8f0fe] text-[#1a73e8]';

        switch (move.type) {
            case 'INGRESO':
            case 'ENTRY':
                return 'bg-[#e6f4ea] text-[#1e8e3e]';
            case 'CONSUMO INTERNO':
            case 'EXIT':
                return 'bg-[#fce8e6] text-[#d93025]';
            case 'RETURN':
                return 'bg-[#fef7e0] text-[#b06000]';
            default:
                return 'bg-[#f1f3f4] text-[#5f6368]';
        }
    };

    const getMovementIcon = (move) => {
        const type = move.type;
        if (type === 'INGRESO' || type === 'ENTRY' || type === 'RETURN') return <ArrowDownLeft size={16} />;
        return <ArrowUpRight size={16} />;
    };

    return (
        <div className="bg-white">
            <div className="flex items-center justify-between px-6 pt-4 border-b border-[#dadce0]">
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setActiveSubTab('internal_entries')}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'internal_entries' ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f8f9fa] rounded-t-lg'}`}
                    >
                        Ingresos y Consumo Interno
                        {activeSubTab === 'internal_entries' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('sales')}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'sales' ? 'text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f8f9fa] rounded-t-lg'}`}
                    >
                        Salidas de Ventas
                        {activeSubTab === 'sales' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-full"></div>}
                    </button>
                </div>

                <div className="pb-2">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-[#e6f4ea] text-[#1e8e3e] rounded-lg hover:bg-[#ceead6] transition-colors text-xs font-medium border border-[#1e8e3e]/20"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Exportar Excel</span>
                    </button>
                </div>
            </div>

            {filteredMovements.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                    <Box className="mx-auto h-12 w-12 text-[#dadce0] mb-4" />
                    <p className="text-[#5f6368] font-medium text-sm">No hay movimientos en esta categoría.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="google-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Producto</th>
                                <th>Referencia</th>
                                <th>Cantidad</th>
                                <th>Responsable / Cliente</th>
                                <th className="text-center">Docs</th>
                                <th className="text-right">Fecha / Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.map((move) => (
                                <tr key={move.id} className="hover:bg-[#f8f9fa] transition-colors">
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${getStatusStyle(move)}`}>
                                                {getMovementIcon(move)}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-tighter">
                                                {getMovementLabel(move)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2">
                                            <Tag size={14} className="text-[#5f6368]" />
                                            <span className="text-sm font-medium text-[#202124] capitalize">
                                                {move.product_name || '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#202124]">{move.reference}</span>
                                            {move.is_returnable && (
                                                <span className="text-[10px] font-bold text-[#b06000] bg-[#fef7e0] px-1.5 py-0.5 rounded border border-[#feefc3] w-fit mt-1">
                                                    RETORNABLE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-medium text-[#202124]">{move.quantity}</span>
                                        <span className="text-xs text-[#5f6368] ml-1">uds</span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#202124]">{move.applicant || '—'}</span>
                                            <span className="text-[11px] text-[#5f6368]">{move.applicant_area}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center space-x-2">
                                            {move.document_path && (
                                                <a
                                                    href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1', '')}/${move.document_path.replace(/\\/g, '/')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-[#5f6368] hover:bg-[#e8f0fe] hover:text-[#1a73e8] rounded-full transition-all"
                                                    title="Ver Documento"
                                                >
                                                    <FileText size={18} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => generateReceiptPDF(move)}
                                                className="p-2 text-[#5f6368] hover:bg-[#e6f4ea] hover:text-[#1e8e3e] rounded-full transition-all"
                                                title="Imprimir Comprobante"
                                            >
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-[#202124]">
                                                {new Date(move.date).toLocaleDateString('es-CL')}
                                            </span>
                                            <span className="text-[11px] text-[#5f6368]">
                                                {new Date(move.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
