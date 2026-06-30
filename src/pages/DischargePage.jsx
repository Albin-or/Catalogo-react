import { useMemo, useState } from 'react';
import { useInventory } from '../hooks/useInventory.jsx';
import styles from './DischargePage.module.css';

export function DischargePage() {
  const { products, stores, checkoutInventory, isSubmitting, error } = useInventory();

  const [responsibleName, setResponsibleName] = useState('');
  const [dischargeReason, setDischargeReason] = useState('');
  const [cart, setCart] = useState([]);
  const [searchField, setSearchField] = useState({ part_number: '', name: '' });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentStockOptions, setCurrentStockOptions] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantityToSub, setQuantityToSub] = useState('');

  const getStoreLabel = (storeId) => {
    const store = stores.find((item) => String(item.id) === String(storeId));
    return store ? store.label : storeId;
  };

  const handleSearchChange = (field, value) => {
    const nextValue = value || '';
    setSearchField((prev) => ({ ...prev, [field]: nextValue }));

    const match = products.find((product) => {
      if (field === 'part_number') {
        return String(product.part_number || '').trim().toLowerCase() === nextValue.trim().toLowerCase();
      }
      return String(product.name || '').trim().toLowerCase() === nextValue.trim().toLowerCase();
    });

    if (match) {
      setCurrentProduct(match);
      setSearchField({ part_number: match.part_number || '', name: match.name || '' });

      const availableStocks = Array.isArray(match.product_stocks)
        ? match.product_stocks.filter((stock) => Number(stock.quantity) > 0)
        : [];

      setCurrentStockOptions(availableStocks);
      setSelectedStockId('');
      setQuantityToSub('');
    } else {
      setCurrentProduct(null);
      setCurrentStockOptions([]);
      setSelectedStockId('');
      setQuantityToSub('');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!currentProduct || !selectedStockId || !quantityToSub) return;

    const selectedStock = currentStockOptions.find((stock) => String(stock.id) === String(selectedStockId));
    const qty = Number(quantityToSub);

    if (!selectedStock) return;
    if (qty <= 0) {
      alert('La cantidad debe ser mayor a cero.');
      return;
    }
    if (qty > Number(selectedStock.quantity)) {
      alert(`No puedes descargar más de lo disponible (${selectedStock.quantity} unidades).`);
      return;
    }

    const existingCartIndex = cart.findIndex((item) => item.stock_id === selectedStock.id);
    if (existingCartIndex > -1) {
      const updatedCart = [...cart];
      const nextQty = updatedCart[existingCartIndex].quantity + qty;

      if (nextQty > Number(selectedStock.quantity)) {
        alert(`La suma en el carrito supera las existencias reales (${selectedStock.quantity}).`);
        return;
      }

      updatedCart[existingCartIndex].quantity = nextQty;
      setCart(updatedCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          stock_id: selectedStock.id,
          product_id: currentProduct.id,
          part_number: currentProduct.part_number,
          name: currentProduct.name,
          brand_name: selectedStock.brands?.name || 'Sin marca',
          store_label: getStoreLabel(selectedStock.store_id),
          quantity: qty
        }
      ]);
    }

    setSearchField({ part_number: '', name: '' });
    setCurrentProduct(null);
    setCurrentStockOptions([]);
    setSelectedStockId('');
    setQuantityToSub('');
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleProcessAndPrint = async () => {
    if (!responsibleName.trim()) {
      alert('Por favor, introduce el nombre del Responsable del Descargo.');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    const payload = cart.map((item) => ({
      stock_id: item.stock_id,
      quantity: item.quantity
    }));

    const result = await checkoutInventory(payload);
    if (result?.success) {
      setTimeout(() => {
        window.print();
        setCart([]);
        setResponsibleName('');
        setDischargeReason('');
      }, 300);
    } else {
      alert(`Error al procesar: ${error || 'Asegúrate de tener stock suficiente en el servidor.'}`);
    }
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart]);

  return (
    <div className={styles.container}>
      <div className={styles.noPrint}>
        <h1 className={styles.title}>Módulo de Descargo (Carrito de Despacho)</h1>

        {error && (
          <div className={styles.errorAlert}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.metaForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Responsable del Descargo *</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Palomino Vergara"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Motivo / Nota de Salida</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ej: Venta"
              value={dischargeReason}
              onChange={(e) => setDischargeReason(e.target.value)}
            />
          </div>
        </div>

        <section className={styles.searchSection}>
          <h3>Añadir Artículo al Despacho</h3>
          <div className={styles.searchGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Buscar por Número de Parte</label>
              <input
                className={styles.input}
                type="text"
                list="parts-list"
                placeholder="Escribe nro de parte..."
                value={searchField.part_number}
                onChange={(e) => handleSearchChange('part_number', e.target.value)}
              />
              <datalist id="parts-list">
                {products.map((product) => (
                  <option key={product.id} value={product.part_number} />
                ))}
              </datalist>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Buscar por Descripción / Nombre</label>
              <input
                className={styles.input}
                type="text"
                list="names-list"
                placeholder="Escribe nombre del repuesto..."
                value={searchField.name}
                onChange={(e) => handleSearchChange('name', e.target.value)}
              />
              <datalist id="names-list">
                {products.map((product) => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>
            </div>
          </div>

          {currentProduct && (
            <form onSubmit={handleAddToCart} className={styles.addToCartRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Seleccionar Marca y Almacén con Stock *</label>
                <select className={styles.input} value={selectedStockId} onChange={(e) => setSelectedStockId(e.target.value)} required>
                  <option value="">-- Elige una opción disponible --</option>
                  {currentStockOptions.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.brands?.name || 'Sin marca'} | {getStoreLabel(stock.store_id)} (Disponibles: {stock.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Cant. Despachar *</label>
                <input className={styles.input} type="number" placeholder="0" value={quantityToSub} onChange={(e) => setQuantityToSub(e.target.value)} required />
              </div>

              <button type="submit" className={styles.primaryButton}>
                + Agregar
              </button>
            </form>
          )}
        </section>
      </div>

      <section className={styles.printBlock}>
        <div className={styles.invoiceHeader}>
          <h2>NOTA DE DESPACHO E INVENTARIO</h2>
          <p><strong>Fecha/Hora:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Responsable:</strong> {responsibleName || '_________________________'}</p>
          {dischargeReason && <p><strong>Motivo/Destino:</strong> {dischargeReason}</p>}
        </div>

        <table className={styles.cartTable}>
          <thead>
            <tr>
              <th>Nro. Parte</th>
              <th>Descripción</th>
              <th>Marca</th>
              <th>Almacén</th>
              <th className={styles.center}>Cantidad</th>
              <th className={`${styles.noPrint} ${styles.actionsCell}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <tr key={`${item.stock_id}-${index}`}>
                  <td>{item.part_number}</td>
                  <td>{item.name}</td>
                  <td>{item.brand_name}</td>
                  <td>{item.store_label}</td>
                  <td className={styles.center}>{item.quantity}</td>
                  <td className={`${styles.noPrint} ${styles.actionsCell}`}>
                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveFromCart(index)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  El carrito está vacío. Agrega repuestos arriba para generar el despacho.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.summaryRow}>
          <p><strong>Total de unidades:</strong> {cartTotal}</p>
        </div>

        <button
          type="button"
          onClick={handleProcessAndPrint}
          disabled={isSubmitting || cart.length === 0}
          className={`${styles.noPrint} ${styles.submitButton}`}
        >
          {isSubmitting ? 'Procesando Salida de Mercancía...' : '🖨️ Procesar Descargo e Imprimir Nota de Salida'}
        </button>
      </section>
    </div>
  );
}
