import { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory.jsx';
import { supabase } from '../supabaseClient';
import styles from './RestockPage.module.css';

export function RestockPage() {
  const { products, stores, addBrand, restockProduct, isSubmitting, error } = useInventory();

  const [partNumberSearch, setPartNumberSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [incomingStocks, setIncomingStocks] = useState([
    { brand_id: '', _brand_name_input: '', _is_new: false, store_id: '', price_1: '', price_2: '', quantity: '' }
  ]);

  useEffect(() => {
    async function loadBrands() {
      const { data } = await supabase.from('brands').select('id, name').order('name');
      if (data) setAvailableBrands(data);
    }

    loadBrands();
  }, []);

  useEffect(() => {
    const trimmed = partNumberSearch.trim();

    if (!trimmed) {
      setSelectedProduct(null);
      return;
    }

    const match = products.find((product) => product.part_number?.toLowerCase() === trimmed.toLowerCase());
    setSelectedProduct(match || null);
  }, [partNumberSearch, products]);

  const handleStockRowChange = (index, field, value) => {
    setIncomingStocks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBrandSelection = (index, value) => {
    const normalizedValue = value?.trim() || '';
    const existingBrand = availableBrands.find(
      (brand) => brand.name.toLowerCase() === normalizedValue.toLowerCase()
    );

    setIncomingStocks((prev) => {
      const updated = [...prev];

      if (existingBrand) {
        updated[index] = {
          ...updated[index],
          brand_id: existingBrand.id,
          _brand_name_input: existingBrand.name,
          _is_new: false
        };
      } else {
        updated[index] = {
          ...updated[index],
          brand_id: '',
          _brand_name_input: normalizedValue,
          _is_new: normalizedValue.length > 0
        };
      }

      return updated;
    });
  };

  const handleCreateBrandInline = async (index) => {
    const row = incomingStocks[index];
    const newBrandName = row._brand_name_input?.trim();

    if (!newBrandName) return;

    const result = await addBrand(newBrandName);

    if (result?.success) {
      setAvailableBrands((prev) => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      handleStockRowChange(index, 'brand_id', result.data.id);
      handleStockRowChange(index, '_is_new', false);
      alert(`Marca "${result.data.name}" creada e integrada en caliente.`);
    } else {
      alert('No se pudo registrar la marca.');
    }
  };

  const addRow = () => {
    setIncomingStocks((prev) => [
      ...prev,
      { brand_id: '', _brand_name_input: '', _is_new: false, store_id: '', price_1: '', price_2: '', quantity: '' }
    ]);
  };

  const removeRow = (index) => {
    if (incomingStocks.length === 1) return;
    setIncomingStocks((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Debes ingresar un número de parte válido y existente.');
      return;
    }

    const isValid = incomingStocks.every((stock) => stock.brand_id && stock.store_id && Number(stock.quantity) > 0);
    if (!isValid) {
      alert('Por favor valida que todas las filas tengan Marca, Almacén y una Cantidad mayor a 0.');
      return;
    }

    const payload = incomingStocks.map((stock) => ({
      product_id: selectedProduct.id,
      brand_id: stock.brand_id,
      store_id: stock.store_id,
      price_1: stock.price_1 || 0,
      price_2: stock.price_2 || 0,
      quantity: stock.quantity
    }));

    const res = await restockProduct(payload);

    if (res?.success) {
      alert('¡Inventario cargado y precios actualizados con éxito!');
      setPartNumberSearch('');
      setIncomingStocks([
        { brand_id: '', _brand_name_input: '', _is_new: false, store_id: '', price_1: '', price_2: '', quantity: '' }
      ]);
    } else {
      alert('Ocurrió un error al procesar la entrada de mercancía.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cargo de Inventario (Entrada de Mercancía)</h1>

      {error && (
        <div className={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Buscar Producto</h3>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Número de Parte / Código de Barra</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Escribe o escanea el número de parte..."
              list="part-number-dataset"
              value={partNumberSearch}
              onChange={(e) => setPartNumberSearch(e.target.value)}
              autoComplete="off"
              required
            />
            <datalist id="part-number-dataset">
              {products.map((product) => (
                <option key={product.id} value={product.part_number} />
              ))}
            </datalist>
          </div>

          {selectedProduct ? (
            <div className={styles.productFeedbackSuccess}>
              <p><strong>✓ Producto Encontrado:</strong> {selectedProduct.name}</p>
              <p className={styles.productFeedbackDescription}>{selectedProduct.description || 'Sin descripción'}</p>
            </div>
          ) : partNumberSearch.trim() !== '' ? (
            <div className={styles.productFeedbackError}>
              <p>⚠️ No existe ningún producto registrado con ese número de parte.</p>
            </div>
          ) : null}
        </section>

        {selectedProduct && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Lote Entrante</h3>
            <p className={styles.helperText}>Los precios ingresados sobrescribirán a los anteriores. Las cantidades se sumarán.</p>

            {incomingStocks.map((stock, index) => (
              <div key={index} className={styles.row}>
                <div className={styles.brandField}>
                  {index === 0 && <label className={styles.label}>Marca *</label>}
                  <div className={styles.brandInputGroup}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Buscar o añadir..."
                      list="restock-brands"
                      value={stock._brand_name_input || ''}
                      onChange={(e) => handleBrandSelection(index, e.target.value)}
                      required
                    />
                    <datalist id="restock-brands">
                      {availableBrands.map((brand) => (
                        <option key={brand.id} value={brand.name} />
                      ))}
                    </datalist>
                    {stock._is_new && (
                      <button
                        type="button"
                        onClick={() => handleCreateBrandInline(index)}
                        className={styles.inlineAddBrandBtn}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  {index === 0 && <label className={styles.label}>Almacén Destino *</label>}
                  <select className={styles.input} value={stock.store_id} onChange={(e) => handleStockRowChange(index, 'store_id', e.target.value)} required>
                    <option value="">Seleccionar</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>{store.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  {index === 0 && <label className={styles.label}>Nuevo Precio 1</label>}
                  <input className={styles.input} type="number" step="0.01" placeholder="0.00" value={stock.price_1} onChange={(e) => handleStockRowChange(index, 'price_1', e.target.value)} />
                </div>

                <div className={styles.fieldGroup}>
                  {index === 0 && <label className={styles.label}>Nuevo Precio 2</label>}
                  <input className={styles.input} type="number" step="0.01" placeholder="0.00" value={stock.price_2} onChange={(e) => handleStockRowChange(index, 'price_2', e.target.value)} />
                </div>

                <div className={styles.fieldGroup}>
                  {index === 0 && <label className={styles.label}>Cant. Entrante</label>}
                  <input className={styles.input} type="number" placeholder="0" value={stock.quantity} onChange={(e) => handleStockRowChange(index, 'quantity', e.target.value)} required />
                </div>

                <div>
                  <button type="button" onClick={() => removeRow(index)} className={styles.removeButton}>
                    X
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addRow} className={styles.secondaryButton}>
              + Añadir otra marca al mismo número de parte
            </button>
          </section>
        )}

        <button type="submit" disabled={isSubmitting || !selectedProduct} className={styles.submitButton}>
          {isSubmitting ? 'Procesando cargo...' : 'Procesar Ingreso de Mercancía'}
        </button>
      </form>
    </div>
  );
}
