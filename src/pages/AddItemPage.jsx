import { useState } from 'react';
import { useInventory } from '../hooks/useInventory.jsx';
import styles from './AddItemPage.module.css';

export function AddItemPage() {
  const { isSubmitting, error, stores, categories, models, addProduct, addBrandToProduct } = useInventory();

  const initialFormState = {
    nombre: '',
    numero_parte: '',
    modelo: [],
    categoria: '',
    almacen: '',
    descripcion: '',
    imagen: '',
    product_brands: [{ marca: '', precio1: '', precio2: '', cantidad: '', almacen: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  // Manejar cambios en los campos generales del producto
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (modelId) => {
    setFormData(prev => {
      const selectedModels = prev.modelo || [];
      const isSelected = selectedModels.includes(modelId);
      const updatedModels = isSelected
        ? selectedModels.filter((id) => id !== modelId)
        : [...selectedModels, modelId];

      return { ...prev, modelo: updatedModels };
    });
  };

  // Manejar cambios en las filas dinámicas de las marcas
  const handleBrandChange = (index, field, value) => {
    setFormData(prev => {
      const updatedBrands = [...prev.product_brands];
      updatedBrands[index] = { ...updatedBrands[index], [field]: value };
      return { ...prev, product_brands: updatedBrands };
    });
  };

  // Añadir una nueva fila de marca vacía al formulario
  const addBrandRow = () => {
    setFormData(prev => ({
      ...prev,
      product_brands: [...prev.product_brands, { marca: '', precio1: '', precio2: '', cantidad: '', almacen: '' }]
    }));
  };

  // Eliminar una fila de marca del formulario
  const removeBrandRow = (index) => {
    if (formData.product_brands.length === 1) return; // Mantiene al menos una fila obligatoria
    setFormData(prev => ({
      ...prev,
      product_brands: prev.product_brands.filter((_, i) => i !== index)
    }));
  };

  // Procesar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.nombre?.trim();
    const trimmedPartNumber = formData.numero_parte?.trim();
    const hasSelectedModel = (formData.modelo || []).length > 0;
    const hasSelectedCategory = Boolean(formData.categoria?.trim());
    const hasSelectedStore = Boolean(formData.almacen?.trim());
    const hasValidBrand = formData.product_brands.some((brand) => brand?.marca?.trim());

    if (!trimmedName || !trimmedPartNumber || !hasSelectedModel || !hasSelectedCategory || !hasSelectedStore || !hasValidBrand) {
      alert('Los campos Nombre del producto, Número de parte, Modelo, Categoría, Almacén y Marca son obligatorios.');
      return;
    }

    const payload = {
      ...formData,
      nombre: formData.nombre?.trim(),
      numero_parte: formData.numero_parte?.trim(),
      categoria: formData.categoria?.trim(),
      almacen: formData.almacen?.trim(),
      descripcion: formData.descripcion?.trim() || '',
      imagen: formData.imagen?.trim() || null,
      product_brands: formData.product_brands.map((brand) => ({
        ...brand,
        marca: brand?.marca?.trim() || '',
        precio1: brand?.precio1 ?? '',
        precio2: brand?.precio2 ?? '',
        cantidad: brand?.cantidad ?? ''
      }))
    };

    const result = await addProduct(payload);

    if (result?.success) {
      setFormData(initialFormState); // Limpia el formulario por completo tras un éxito
      alert('¡Producto y marcas añadidos correctamente!');
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
              <input className={styles.input} name="nombre" value={formData.nombre} onChange={handleProductChange} required />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Número de Parte *</label>
              <input className={styles.input} name="numero_parte" value={formData.numero_parte} onChange={handleProductChange} required />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Modelo *</label>
              <div className={styles.checkboxGroup}>
                {models.map((model) => {
                  const isChecked = (formData.modelo || []).includes(model.id);
                  return (
                    <label key={model.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleModelChange(model.id)}
                      />
                      <span>{model.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Categoría *</label>
              <select className={styles.input} name="categoria" value={formData.categoria} onChange={handleProductChange}>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Almacén *</label>
              <select className={styles.input} name="almacen" value={formData.almacen} onChange={handleProductChange} required>
                <option value="">Selecciona un almacén</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Descripción</label>
              <input className={styles.input} name="descripcion" value={formData.descripcion} onChange={handleProductChange} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Imagen (opcional)</label>
              <input className={styles.input} name="imagen" value={formData.imagen} onChange={handleProductChange} placeholder="https://..." />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Marcas, Precios y Cantidades</h3>
          <p className={styles.helperText}>Puedes asignar múltiples marcas a este mismo producto.</p>

          {formData.product_brands.map((brand, index) => (
            <div key={index} className={styles.brandRow}>
              <div className={styles.brandFieldWide}>
                {index === 0 && <label className={styles.label}>Marca *</label>}
                <input className={styles.input} placeholder="Ej: Bosch" value={brand.marca} onChange={(e) => handleBrandChange(index, 'marca', e.target.value)} required />
              </div>
              <div className={styles.brandField}>
                {index === 0 && <label className={styles.label}>Precio 1</label>}
                <input className={styles.input} type="number" step="0.01" placeholder="0.00" value={brand.precio1} onChange={(e) => handleBrandChange(index, 'precio1', e.target.value)} />
              </div>
              <div className={styles.brandField}>
                {index === 0 && <label className={styles.label}>Precio 2</label>}
                <input className={styles.input} type="number" step="0.01" placeholder="0.00" value={brand.precio2} onChange={(e) => handleBrandChange(index, 'precio2', e.target.value)} />
              </div>
              <div className={styles.brandField}>
                {index === 0 && <label className={styles.label}>Cantidad</label>}
                <input className={styles.input} type="number" placeholder="0" value={brand.cantidad} onChange={(e) => handleBrandChange(index, 'cantidad', e.target.value)} />
              </div>

              {formData.product_brands.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => removeBrandRow(index)}>
                  X
                </button>
              )}
            </div>
          ))}

          <button type="button" className={styles.addButton} onClick={addBrandRow}>
            + Añadir otra marca
          </button>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? 'Guardando Producto...' : 'Registrar Producto Completo'}
          </button>
        </div>
      </form>
    </div>
  );
}
