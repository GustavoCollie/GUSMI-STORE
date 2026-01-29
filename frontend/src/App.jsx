import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, LogOut, Github, TrendingUp, AlertCircle, History, LayoutDashboard } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { ProductTable } from './components/Dashboard/ProductTable';
import { MovementTable } from './components/Dashboard/MovementTable';
import { ProductForm } from './components/Forms/ProductForm';
import { SellProductModal } from './components/Dashboard/SellProductModal';
import { StockInModal } from './components/Dashboard/StockInModal';
import { ConfirmationModal } from './components/UI/ConfirmationModal';

function App() {
  const navigate = useNavigate();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'movements'

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthChecking(false);
    }
  }, [navigate]);

  const {
    products,
    movements,
    loading,
    movementsLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refresh
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [productToSell, setProductToSell] = useState(null);
  const [productToReplenish, setProductToReplenish] = useState(null);

  // State for delete confirmation
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product) => {
    // Buscar el movimiento inicial (el más antiguo de tipo ENTRY)
    const productMovements = movements.filter(m => m.product_id === product.id && m.type === 'ENTRY');
    const initialMove = productMovements.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    setEditingProduct({
      ...product,
      initial_reference: initialMove?.reference || '',
      initial_document_path: initialMove?.document_path || null
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
        setProductToDelete(null);
        setShowDeleteModal(false);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (data) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      refresh(); // Refrescar para ver cambios en trazabilidad
    } else {
      await createProduct(data);
    }
  };


  const handleSell = async (productId, data) => {
    try {
      await updateStock(productId, data, 'sell');
      setProductToSell(null);
    } catch (err) {
      throw err;
    }
  };

  const handleReplenish = async (productId, data) => {
    try {
      await updateStock(productId, data, 'receive');
      setProductToReplenish(null);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-12 relative">
        {/* Navbar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-slide-in">
          <div className="flex items-center space-x-5">
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
              <Package size={34} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Collie Almacenes</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.25em] mt-2">Gestión Inteligente de Activos</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 transition-all text-sm font-bold text-white shadow-lg active:scale-95"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <section className="mb-12 animate-fade-in">
          <DashboardStats products={products} />
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mb-10 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-200 animate-fade-in shadow-sm">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-black transition-all ${activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
          >
            <LayoutDashboard size={18} />
            <span className="tracking-widest">INVENTARIO</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-black transition-all ${activeTab === 'movements'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
          >
            <History size={18} />
            <span className="tracking-widest">TRAZABILIDAD</span>
          </button>
        </div>

        {/* Main Content Area */}
        <main className="space-y-8 animate-fade-in">
          {activeTab === 'inventory' ? (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-xl group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, descripción o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="group flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95"
                >
                  <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="tracking-widest uppercase">Nuevo Producto</span>
                </button>
              </div>

              {error && (
                <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-600 text-sm flex items-center space-x-4 animate-shake">
                  <div className="p-2 bg-rose-600 rounded-xl">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black uppercase tracking-tight">Error del Sistema</p>
                    <p className="font-medium opacity-80">{error}</p>
                  </div>
                  <button onClick={refresh} className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-colors shadow-sm active:scale-95">Reintentar</button>
                </div>
              )}

              <ProductTable
                products={filteredProducts}
                loading={loading}
                onReplenish={(product) => setProductToReplenish(product)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSell={setProductToSell}
              />
            </>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Registro de Movimientos</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Trazabilidad completa de operaciones</p>
                </div>
                <button
                  onClick={refresh}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95"
                >
                  Actualizar Trazabilidad
                </button>
              </div>
              <MovementTable movements={movements} loading={movementsLoading} />
            </>
          )}
        </main>

        <footer className="mt-32 py-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Collie Almacenes PRO • 2026</p>
        </footer>
      </div>

      {/* Modals & Overlays */}
      {showForm && (
        <ProductForm
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingProduct}
          loading={loading}
        />
      )}

      {productToSell && (
        <SellProductModal
          product={productToSell}
          onConfirm={handleSell}
          onClose={() => setProductToSell(null)}
          loading={loading}
        />
      )}

      {productToReplenish && (
        <StockInModal
          product={productToReplenish}
          onConfirm={handleReplenish}
          onClose={() => setProductToReplenish(null)}
          loading={loading}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y el registro desaparecerá permanentemente.`}
        />
      )}
    </div>
  );
}

export default App;
