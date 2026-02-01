import { LayoutGrid, Package, AlertTriangle, TrendingDown } from 'lucide-react';

export const DashboardStats = ({ products }) => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const outOfStock = products.filter(p => p.stock === 0).length;

    const stats = [
        { label: 'Total Productos', value: totalProducts, icon: Package, color: 'text-[#1a73e8]', bg: 'bg-[#e8f0fe]' },
        { label: 'Unidades en Stock', value: totalStock, icon: LayoutGrid, color: 'text-[#1a73e8]', bg: 'bg-[#e8f0fe]' },
        { label: 'Stock Bajo', value: lowStock, icon: TrendingDown, color: 'text-[#f9ab00]', bg: 'bg-[#fef7e0]' },
        { label: 'Agotados', value: outOfStock, icon: AlertTriangle, color: 'text-[#d93025]', bg: 'bg-[#fce8e6]' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="google-card p-6 flex items-center space-x-5 !rounded-2xl border-[#e8eaed]">
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                        <stat.icon size={26} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-[#5f6368] uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-medium text-[#202124] mt-1">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
