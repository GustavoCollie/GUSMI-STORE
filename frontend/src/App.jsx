import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, LogOut, Github, TrendingUp, AlertCircle, History, LayoutDashboard, ShoppingBag, ShoppingCart, BarChart2 } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { ProductTable } from './components/Dashboard/ProductTable';
import { MovementTable } from './components/Dashboard/MovementTable';
import { ProductForm } from './components/Forms/ProductForm';
import { SellProductModal } from './components/Dashboard/SellProductModal';
import { StockInModal } from './components/Dashboard/StockInModal';
import { ConfirmationModal } from './components/UI/ConfirmationModal';
import { usePurchasing } from './hooks/usePurchasing';
import { PurchasingDashboard } from './components/Dashboard/PurchasingDashboard';
import { PurchaseOrderForm } from './components/Forms/PurchaseOrderForm';
import { SupplierForm } from './components/Forms/SupplierForm';
import { useSales } from './hooks/useSales';
import { SalesDashboard } from './components/Dashboard/SalesDashboard';
import { SalesOrderForm } from './components/Forms/SalesOrderForm';
import { AnalyticsDashboard } from './components/Dashboard/AnalyticsDashboard';

function App() {
  const navigate = useNavigate();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'purchasing', 'sales', 'inventory', or 'movements'

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

  const {
    suppliers,
    orders: purchaseOrders,
    kpis: purchaseKpis,
    loading: purchasingLoading,
    error: purchasingError,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createOrder: createPurchaseOrder,
    updateOrder: updatePurchaseOrder
  } = usePurchasing();

  const {
    orders: salesOrders,
    kpis: salesKpis,
    loading: salesLoading,
    error: salesError,
    createOrder: createSalesOrder,
    updateOrder: updateSalesOrder,
    deleteOrder: deleteSalesOrder,
    refresh: refreshSales
  } = useSales();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSalesOrderForm, setShowSalesOrderForm] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  // Modals state
  const [productToSell, setProductToSell] = useState(null);
  const [productToReplenish, setProductToReplenish] = useState(null);

  // State for delete confirmation
  const [productToDelete, setProductToDelete] = useState(null);
  const [salesOrderToDelete, setSalesOrderToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSalesDeleteModal, setShowSalesDeleteModal] = useState(false);

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
      refreshSales(); // Refresh orders to remove completed one
      setProductToSell(null);
    } catch (err) {
      throw err;
    }
  };

  const handleReplenish = async (productId, data) => {
    try {
      // Usamos el subtipo 'return' para distinguir devoluciones de compras
      await updateStock(productId, data, 'return');
      setProductToReplenish(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEditSalesOrder = (order) => {
    setEditingSalesOrder(order);
    setShowSalesOrderForm(true);
  };

  const handleDeleteSalesOrder = (id) => {
    setSalesOrderToDelete(id);
    setShowSalesDeleteModal(true);
  };

  const handleConfirmDeleteSalesOrder = async () => {
    if (salesOrderToDelete) {
      try {
        await deleteSalesOrder(salesOrderToDelete);
        setSalesOrderToDelete(null);
        setShowSalesDeleteModal(false);
      } catch (err) {
        alert(err.message);
      }
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
    <div className="min-h-screen bg-white font-['Inter'] text-[#3c4043]">
      {/* Google-style Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#dadce0] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-[22px] font-medium text-[#202124] tracking-tight ml-1">Collie <span className="text-[#5f6368] font-normal">Inventario</span></span>
        </div>

        <div className="flex-1 max-w-2xl mx-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f6368]">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar en inventario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f1f3f4] border-transparent border-2 focus:bg-white focus:border-[#1a73e8] focus:ring-0 rounded-lg py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#202124]">Jefe de Almacén</p>
            <p className="text-[10px] text-[#5f6368] uppercase tracking-wider">Administrador</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="p-2 text-[#5f6368] hover:bg-[#fce8e6] hover:text-[#d93025] rounded-full transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-8">
        {/* Navigation Tabs - Google Style */}
        <div className="flex items-center space-x-1 border-b border-[#dadce0] mb-8">
          {[
            { id: 'purchasing', label: 'Compras', icon: ShoppingBag },
            { id: 'sales', label: 'Ventas', icon: ShoppingCart },
            { id: 'business', label: 'Negocio', icon: BarChart2 },
            { id: 'inventory', label: 'Inventario', icon: Package },
            { id: 'movements', label: 'Movimientos', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                ? 'text-[#1a73e8]'
                : 'text-[#5f6368] hover:bg-[#f8f9fa] rounded-t-lg'
                }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'purchasing' && (
          <div className="animate-fade-in">
            <PurchasingDashboard
              suppliers={suppliers}
              orders={purchaseOrders}
              kpis={purchaseKpis}
              loading={purchasingLoading}
              error={purchasingError}
              onAddSupplier={() => setShowSupplierForm(true)}
              onUpdateSupplier={updateSupplier}
              onDeleteSupplier={deleteSupplier}
              onAddOrder={() => setShowOrderForm(true)}
              onAddProduct={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              onUpdateOrderStatus={async (id, data) => {
                if (data instanceof FormData) {
                  await updatePurchaseOrder(id, data);
                  refresh();
                } else if (typeof data === 'string') {
                  const is_rejected = data === 'REJECTED';
                  const is_arrived = data === 'ARRIVED';

                  await updatePurchaseOrder(id, {
                    status: data,
                    is_rejected,
                    actual_delivery_date: (is_rejected || is_arrived) ? new Date().toISOString() : null,
                    rejection_reason: is_rejected ? "Rechazo manual por usuario" : null
                  });
                }
              }}
            />
          </div>
        )}
        {activeTab === 'sales' && (
          <div className="animate-fade-in">
            <SalesDashboard
              orders={salesOrders}
              kpis={salesKpis}
              loading={salesLoading}
              error={salesError}
              onAddOrder={() => setShowSalesOrderForm(true)}
              onEditOrder={handleEditSalesOrder}
              onDeleteOrder={handleDeleteSalesOrder}
            />
          </div>
        )}
        {activeTab === 'business' && (
          <AnalyticsDashboard />
        )}
        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Summary */}
            <DashboardStats products={products} movements={movements} />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-[#202124]">Catálogo de Productos</h2>
                <p className="text-sm text-[#5f6368] mt-1">Gestiona las existencias y detalles técnicos de tu almacén</p>
              </div>
            </div>

            {error ? (
              <div className="bg-[#fce8e6] border border-[#f5c2c7] text-[#d93025] p-6 rounded-2xl flex items-center space-x-4">
                <AlertCircle size={24} />
                <div>
                  <p className="font-bold">Error al cargar inventario</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button
                  onClick={refresh}
                  className="ml-auto bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm">
                <ProductTable
                  products={filteredProducts}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReturn={(p) => setProductToReplenish(p)}
                  onSell={(p) => setProductToSell(p)}
                />
              </div>
            )}
          </div>
        )}
        {activeTab === 'movements' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-[#202124]">Historial de Movimientos</h2>
                <p className="text-sm text-[#5f6368] mt-1">Trazabilidad completa de entradas y salidas de almacén</p>
              </div>
            </div>
            <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm">
              <MovementTable movements={movements} loading={movementsLoading} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 py-8 border-t border-[#dadce0] text-center">
        <p className="text-[#5f6368] text-xs font-medium">Collie Almacenes • © 2026 • Design by Google Style</p>
      </footer>

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
          salesOrders={salesOrders.filter(so => so.status === 'PENDING')}
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
          title="Eliminar producto"
          message={`¿Quieres eliminar este producto permanentemente? Esta acción no se puede deshacer.`}
        />
      )}

      {showOrderForm && (
        <PurchaseOrderForm
          suppliers={suppliers}
          products={products}
          loading={purchasingLoading}
          onClose={() => setShowOrderForm(false)}
          onSubmit={async (data) => {
            await createPurchaseOrder(data);
            setShowOrderForm(false);
          }}
        />
      )}

      {showSupplierForm && (
        <SupplierForm
          suppliers={suppliers}
          products={products}
          loading={purchasingLoading}
          onClose={() => setShowSupplierForm(false)}
          onSubmit={async (data) => {
            await createSupplier(data);
            setShowSupplierForm(false);
          }}
          onUpdate={async (id, data) => {
            await updateSupplier(id, data);
            setShowSupplierForm(false);
          }}
          onDelete={deleteSupplier}
        />
      )}

      {showSalesOrderForm && (
        <SalesOrderForm
          products={products}
          loading={salesLoading}
          onClose={() => {
            setShowSalesOrderForm(false);
            setEditingSalesOrder(null);
          }}
          initialData={editingSalesOrder}
          onSubmit={async (data) => {
            if (editingSalesOrder) {
              await updateSalesOrder(editingSalesOrder.id, data);
            } else {
              await createSalesOrder(data);
            }
            setShowSalesOrderForm(false);
            setEditingSalesOrder(null);
          }}
        />
      )}

      {showSalesDeleteModal && (
        <ConfirmationModal
          isOpen={showSalesDeleteModal}
          onClose={() => {
            setShowSalesDeleteModal(false);
            setSalesOrderToDelete(null);
          }}
          onConfirm={handleConfirmDeleteSalesOrder}
          title="Eliminar orden de venta"
          message="¿Seguro que deseas eliminar esta orden de venta? Esta acción no se puede deshacer."
        />
      )}
    </div>
  );
}

export default App;
