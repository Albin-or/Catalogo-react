import { useState } from 'react';
import styles from './ItemPage.module.css';
import { useRouter } from '../hooks/useRouter.jsx';
import { useInventory } from '../hooks/useInventory.jsx';
import { Img } from '../components/Img.jsx';

export function ItemPage() {
    const { getQueryParam, navigateTo } = useRouter();
    const partId = getQueryParam('id');
    const { products, updateProduct, deleteProduct, isSubmitting, stores, categories, models } = useInventory();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [saveFeedback, setSaveFeedback] = useState('');

    // Buscamos el producto por ID en la lista cargada por el hook
    const product = products.find((p) => String(p.id) === String(partId));

    if (!product) {
        return <main><p>Producto no encontrado</p></main>;
    }

    // Obtener la etiqueta del almacén dinámicamente desde el catálogo de la BD
    const getStoreLabel = (storeId) => {
        const store = stores.find(s => s.id === storeId);
        return store ? store.label : 'Desconocido';
    };

    // Obtener la etiqueta de la categoría dinámicamente desde el catálogo de la BD
    const getCategoryLabel = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.label : categoryId;
    };

    const getModelLabels = (product) => {
        if (Array.isArray(product.product_models) && product.product_models.length > 0) {
            return product.product_models
                .map((item) => item?.models?.label || item?.label)
                .filter(Boolean);
        }

        if (Array.isArray(product.model_ids) && product.model_ids.length > 0) {
            return product.model_ids
                .map((modelId) => {
                    const model = models.find(m => String(m.id) === String(modelId));
                    return model ? model.label : modelId;
                })
                .filter(Boolean);
        }

        if (product.model_id) {
            const model = models.find(m => String(m.id) === String(product.model_id));
            return model ? [model.label] : [product.model_id];
        }

        return [];
    };

    const formatCurrency = (value) => {
        const numericValue = Number(value ?? 0);
        return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '0.00';
    };

    const categoryOptions = Array.isArray(categories) ? categories : [];
    
    // Obtenemos los stocks vinculados y filtramos los que tengan cantidad mayor a 0
    const activeStocks = Array.isArray(product.product_stocks) 
        ? product.product_stocks.filter(stock => Number(stock.quantity) > 0) 
        : [];

    // Activar modo edición cargando ÚNICAMENTE los valores base del producto (sin alterar stock)
    const handleStartEdit = () => {
        setFormData({
            id: product.id,
            name: product.name || '',
            part_number: product.part_number || '',
            description: product.description || '',
            category_id: product.category_id || '',
            image_url: product.image_url || ''
        });
        setIsEditing(true);
    };

    // Manejador de cambios para inputs generales de información del producto
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Guardar los cambios informativos en Supabase
    const handleSaveClick = async () => {
        if (!formData) {
            setSaveFeedback('No hay datos para guardar.');
            return;
        }

        setSaveFeedback('Guardando...');
        const result = await updateProduct(formData);
        if (result?.success) {
            setIsEditing(false);
            setSaveFeedback('Producto actualizado correctamente.');
        } else {
            setSaveFeedback('No se pudo guardar el producto. Intenta de nuevo.');
        }
    };

    const handleDeleteClick = async () => {
        const confirmed = window.confirm('¿Seguro que deseas eliminar este producto por completo del sistema?');
        if (!confirmed) return;

        setSaveFeedback('Eliminando producto...');
        const result = await deleteProduct(product.id);
        if (result?.success) {
            setSaveFeedback('Producto eliminado correctamente.');
            navigateTo('/');
        } else {
            setSaveFeedback('No se pudo eliminar el producto. Intenta de nuevo.');
        }
    };

    return (
        <main>
            <section className={styles.mainProductCard}>
                <Img className={styles.mainProductImage} alt="Producto" src={product.image_url} />
                <div className={styles.mainProductInfo}>
                    {isEditing ? (
                        /* VISTA EDICIÓN: INPUTS GENERALES */
                        <div className={styles.productDetails}>
                            <div className={styles.fieldColumn}>
                                <strong>Nombre del Producto:</strong>
                                <input
                                    name="name"
                                    className={`${styles.mainProductTitle} ${styles.editTitleInput}`}
                                    value={formData.name}
                                    onChange={handleProductChange}
                                />
                            </div>
                            <p className={styles.fieldRow}>
                                <strong>Número de parte:</strong>
                                <input name="part_number" className={styles.editInput} value={formData.part_number} onChange={handleProductChange} />
                            </p>
                            <p className={styles.fieldColumn}>
                                <strong>Descripción:</strong>
                                <textarea name="description" className={styles.editTextarea} value={formData.description} onChange={handleProductChange} />
                            </p>
                            <p className={styles.fieldRow}>
                                <strong>Categoría:</strong>
                                <select name="category_id" className={styles.editSelect} value={formData.category_id} onChange={handleProductChange}>
                                    <option value="">Seleccionar</option>
                                    {categoryOptions.map((category) => (
                                        <option key={category.id} value={category.id}>{category.label}</option>
                                    ))}
                                </select>
                            </p>
                        </div>
                    ) : (
                        /* VISTA LECTURA (ORIGINAL) */
                        <>
                            <h2 className={styles.mainProductTitle}>{product.name}</h2>
                            <div className={styles.productDetails}>
                                <p><strong>Número de parte:</strong> {product.part_number}</p>
                                <p><strong>Descripción:</strong> {product.description || 'Sin descripción'}</p>
                                <p><strong>Categoría:</strong> {getCategoryLabel(product.category_id)}</p>
                                {(() => {
                                    const modelLabels = getModelLabels(product);
                                    return modelLabels.length > 0 ? (
                                        <p><strong>Modelos:</strong> {modelLabels.join(', ')}</p>
                                    ) : null;
                                })()}
                            </div>
                        </>
                    )}

                    {/* BOTONES DE CONTROL DE ESTADO */}
                    {isEditing ? (
                        <div className={styles.actionButtons}>
                            <button onClick={handleSaveClick} disabled={isSubmitting} className={`${styles.editButton} ${styles.saveButton}`}>
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className={`${styles.editButton} ${styles.cancelButton}`}>
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className={styles.actionButtons}>
                            <button onClick={handleStartEdit} className={`${styles.editButton} ${styles.detailActionButton}`}>Editar</button>
                            <button onClick={handleDeleteClick} disabled={isSubmitting} className={`${styles.editButton} ${styles.deleteButton}`}>
                                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    )}
                    {saveFeedback ? <p className={styles.saveFeedback}>{saveFeedback}</p> : null}
                </div>
            </section>

            <div className={styles.tableContainer}>
                <table>
                    <caption>Inventario Disponible</caption>
                    <thead>
                        <tr>
                            <th>Marca</th>
                            <th>Precio 1</th>
                            <th>Precio 2</th>
                            <th>Cantidad</th>
                            <th>Almacén</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeStocks.length > 0 ? (
                            /* VISTA LECTURA DE TABLA (FILTRADA: SOLO CANTIDAD > 0) */
                            activeStocks.map((stock, index) => (
                                <tr key={stock.id || index}>
                                    {/* Nombre de la marca desde la relación anidada */}
                                    <td>{stock.brands?.name || 'Sin Marca'}</td>
                                    <td>${formatCurrency(stock.price_1)}</td>
                                    <td>${formatCurrency(stock.price_2)}</td>
                                    <td>{stock.quantity}</td>
                                    {/* Etiqueta del almacén calculada dinámicamente */}
                                    <td>{getStoreLabel(stock.store_id)}</td>
                                </tr>
                            ))
                        ) : (
                            /* MENSAJE EN CASO DE NO HABER EXISTENCIAS */
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                                    No hay existencias disponibles para este producto en ningún almacén.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
