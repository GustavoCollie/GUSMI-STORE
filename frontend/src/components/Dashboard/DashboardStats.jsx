import { LayoutGrid, Package, AlertTriangle, TrendingDown } from 'lucide-react';

export const DashboardStats = ({ products }) => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock <= 5).length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const outOfStock = products.filter(p => p.stock === 0).length;

    const stats = [
        { label: 'Total Productos', value: totalProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Stock', value: totalStock, icon: LayoutGrid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Stock Bajo', value: lowStock, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Agotados', value: outOfStock, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 border border-slate-200/50 flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
