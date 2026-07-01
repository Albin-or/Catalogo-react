import { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory.jsx';
import { supabase } from '../supabaseClient';
import styles from './AddItemPage.module.css';

export function AddItemPage() {
  const { isSubmitting, error, stores, categories, models, addProduct, addBrand } = useInventory();
  const [availableBrands, setAvailableBrands] = useState([]);

  const initialFormState = {
    name: '',
    part_number: '',
    model_id: '',
    model_ids: [],
    category_id: '',
    description: '',
    image_url: '',
    product_stocks: [{ brand_id: '', _brand_name_input: '', _is_new: false, price_1: '', price_2: '', quantity: '', store_id: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  // Cargar el catálogo de marcas para el selector de las filas desde la base de datos
  useEffect(() => {
    async function loadBrands() {
      const { data } = await supabase.from('brands').select('id, name').order('name');
      if (data) setAvailableBrands(data);
    }
    loadBrands();
  }, []);

  // Manejar cambios en los campos generales del producto
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en las filas dinámicas de inventario
  const handleStockChange = (index, field, value) => {
    setFormData(prev => {
      const updatedStocks = [...prev.product_stocks];
      updatedStocks[index] = { ...updatedStocks[index], [field]: value };
      return { ...prev, product_stocks: updatedStocks };
    });
  };

  const handleBrandSelection = (index, value) => {
    const normalizedValue = value?.trim() || '';
    const existingBrand = availableBrands.find(
      (brand) => brand.name.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (existingBrand) {
      handleStockChange(index, 'brand_id', existingBrand.id);
      handleStockChange(index, '_brand_name_input', existingBrand.name);
      handleStockChange(index, '_is_new', false);
    } else {
      handleStockChange(index, 'brand_id', '');
      handleStockChange(index, '_brand_name_input', normalizedValue);
      handleStockChange(index, '_is_new', normalizedValue.length > 0);
    }
  };

  const handleCreateBrandInline = async (index) => {
    const stockRow = formData.product_stocks[index];
    const newBrandName = stockRow._brand_name_input?.trim();

    if (!newBrandName) return;

    const existingBrand = availableBrands.find(
      (brand) => brand.name.toLowerCase() === newBrandName.toLowerCase()
    );

    if (existingBrand) {
      handleStockChange(index, 'brand_id', existingBrand.id);
      handleStockChange(index, '_brand_name_input', existingBrand.name);
      handleStockChange(index, '_is_new', false);
      return;
    }

    const result = await addBrand(newBrandName);

    if (result?.success) {
      setAvailableBrands((prev) => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      handleStockChange(index, 'brand_id', result.data.id);
      handleStockChange(index, '_brand_name_input', result.data.name);
      handleStockChange(index, '_is_new', false);
      alert(`Marca "${result.data.name}" creada y seleccionada correctamente.`);
    } else {
      alert('Error al crear la marca en el sistema.');
    }
  };

  const handleModelSelect = (modelId) => {
    setFormData(prev => {
      const isSelected = prev.model_ids.some(id => String(id) === String(modelId));
      const selectedIds = isSelected
        ? prev.model_ids.filter(id => String(id) !== String(modelId))
        : [...prev.model_ids, modelId];

      return {
        ...prev,
        model_ids: selectedIds,
        model_id: selectedIds[0] || ''
      };
    });
  };

  // Añadir una nueva fila de inventario vacía
  const addStockRow = () => {
    setFormData(prev => ({
      ...prev,
      product_stocks: [...prev.product_stocks, { brand_id: '', _brand_name_input: '', _is_new: false, price_1: '', price_2: '', quantity: '', store_id: '' }]
    }));
  };

  // Eliminar una fila de inventario
  const removeStockRow = (index) => {
    if (formData.product_stocks.length === 1) return;
    setFormData(prev => ({
      ...prev,
      product_stocks: prev.product_stocks.filter((_, i) => i !== index)
    }));
  };

  // Procesar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name?.trim();
    const trimmedPartNumber = formData.part_number?.trim();
    const hasSelectedModel = Array.isArray(formData.model_ids) && formData.model_ids.length > 0;
    const hasSelectedCategory = Boolean(formData.category_id);
    
    // Validar que todas las filas de inventario tengan marca y almacén seleccionados
    const hasValidStocks = formData.product_stocks.every(
      stock => Boolean(stock.brand_id) && Boolean(stock.store_id)
    );

    if (!trimmedName || !trimmedPartNumber || !hasSelectedModel || !hasSelectedCategory || !hasValidStocks) {
      alert('Los campos Nombre, Número de Parte, Modelo, Categoría y todas las Marcas/Almacenes seleccionados son obligatorios.');
      return;
    }

    const payload = {
      name: trimmedName,
      part_number: trimmedPartNumber,
      model_id: formData.model_ids[0] || '',
      model_ids: formData.model_ids,
      category_id: formData.category_id,
      description: formData.description?.trim() || '',
      image_url: formData.image_url?.trim() || null,
      product_stocks: formData.product_stocks.map((stock) => ({
        brand_id: stock.brand_id,
        store_id: stock.store_id,
        price_1: stock.price_1 || 0,
        price_2: stock.price_2 || 0,
        quantity: stock.quantity || 0
      }))
    };

    const result = await addProduct(payload);

    if (result?.success) {
      setFormData(initialFormState);
      alert('¡Producto e inventario inicial añadidos correctamente!');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Añadir Nuevo Producto al Inventario</h1>

      {error && (
        <div className={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Información General</h3>
          <div className={styles.gridTwoColumns}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre del Producto *</label>
              <input className={styles.input} name="name" value={formData.name} onChange={handleProductChange} required />
            </div>
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Número de Parte *</label>
              <input className={styles.input} name="part_number" value={formData.part_number} onChange={handleProductChange} required />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Modelos *</label>
              <div className={styles.checkboxGrid}>
                {models.map((model) => (
                  <label key={model.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.model_ids.some(id => String(id) === String(model.id))}
                      onChange={() => handleModelSelect(model.id)}
                    />
                    <span>{model.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Categoría *</label>
              <select className={styles.input} name="category_id" value={formData.category_id} onChange={handleProductChange} required>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Descripción</label>
              <input className={styles.input} name="description" value={formData.description} onChange={handleProductChange} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Imagen (opcional)</label>
              <input className={styles.input} name="image_url" value={formData.image_url} onChange={handleProductChange} placeholder="https://..." />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Marcas, Precios y Almacenes</h3>
          <p className={styles.helperText}>Asigna las marcas y las existencias físicas iniciales para este artículo.</p>

          {formData.product_stocks.map((stock, index) => (
            <div key={index} className={styles.brandRow}>
              <div className={styles.brandFieldWide}>
                {index === 0 && <label className={styles.label}>Marca *</label>}
                <div className={styles.brandInputRow}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Welcome to my party"
                    list="brands-dataset"
                    value={stock._brand_name_input ?? ''}
                    onChange={(e) => handleBrandSelection(index, e.target.value)}
                    autoComplete="off"
                    required
                  />

                  <datalist id="brands-dataset">
                    {availableBrands.map((brand) => (
                      <option key={brand.id} value={brand.name} />
                    ))}
                  </datalist>

                  {stock._is_new && (
                    <button
                      type="button"
                      onClick={() => handleCreateBrandInline(index)}
                      className={styles.createBrandButton}
                      title="Crear como nueva marca en el sistema"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.storeField}>
                {index === 0 && <label className={styles.label}>Almacén *</label>}
                <select className={styles.input} value={stock.store_id} onChange={(e) => handleStockChange(index, 'store_id', e.target.value)} required>
                  <option value="">Seleccionar Almacén</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.stockField}>
                {index === 0 && <label className={styles.label}>Precio 1</label>}
                <input className={styles.input} type="number" step="1" placeholder="0.00" value={stock.price_1} onChange={(e) => handleStockChange(index, 'price_1', e.target.value)} />
              </div>

              <div className={styles.stockField}>
                {index === 0 && <label className={styles.label}>Precio 2</label>}
                <input className={styles.input} type="number" step="1" placeholder="0.00" value={stock.price_2} onChange={(e) => handleStockChange(index, 'price_2', e.target.value)} />
              </div>

              <div className={styles.stockField}>
                {index === 0 && <label className={styles.label}>Cant.</label>}
                <input className={styles.input} type="number" step="1" placeholder="0" value={stock.quantity} onChange={(e) => handleStockChange(index, 'quantity', e.target.value)} required />
              </div>

              <div>
                <button style={formData.product_stocks.length === 1 ? {display: 'none'} : {}} type="button" onClick={() => removeStockRow(index)} className={styles.removeButton}>
                  X
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addStockRow} className={styles.addButton}>
            + Añadir otra marca/almacén
          </button>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? 'Guardando producto...' : 'Registrar Producto Completo'}
          </button>
        </div>
      </form>
    </div>
  );
}
