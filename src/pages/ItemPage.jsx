import { useState } from 'react';
import styles from './ItemPage.module.css';
import { useRouter } from '../hooks/useRouter.jsx';
import { useInventory } from '../hooks/useInventory.jsx';

export function ItemPage() {
    const { getQueryParam, navigateTo } = useRouter();
    const partId = getQueryParam('id');
    const { products, updateProduct, deleteProduct, isSubmitting, stores, categories } = useInventory();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [saveFeedback, setSaveFeedback] = useState('');

    const product = products.find((p) => String(p.id) === String(partId));

    if (!product) {
        return <main><p>Product not found</p></main>;
    }

    const getStoreLabel = (storeId) => {
        if (storeId === 'almacen1') return 'Almacén Toyosur';
        if (storeId === 'almacen2') return 'Toyocars Delicias';
        return 'Desconocido';
    };

    const formatCurrency = (value) => {
        const numericValue = Number(value ?? 0);
        return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '0.00';
    };

    // Mapeo de almacén para la vista de lectura
    const almacenText = getStoreLabel(product.almacen);
    const storeOptions = Array.isArray(stores) ? stores : [];
    const categoryOptions = Array.isArray(categories) ? categories : [];
    const productBrands = Array.isArray(product.product_brands) ? product.product_brands : [];

    // 2. Activar modo edición cargando los valores actuales
    const handleStartEdit = () => {
        const existingBrands = Array.isArray(product.product_brands) ? product.product_brands : [];

        setFormData({
            id: product.id,
            nombre: product.nombre || '',
            numero_parte: product.numero_parte || '',
            descripcion: product.descripcion || '',
            categoria: product.categoria || '',
            imagen: product.imagen || '',
            product_brands: existingBrands.map((brand) => ({
                marca: brand.marca || '',
                precio1: brand.precio1 ?? '',
                precio2: brand.precio2 ?? '',
                cantidad: brand.cantidad ?? '',
                almacen: brand.almacen || product.almacen || ''
            }))
        });
        setIsEditing(true);
    };

    // 3. Manejadores de cambios para inputs generales y del array de marcas
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBrandChange = (index, field, value) => {
        setFormData(prev => {
            const updatedBrands = [...prev.product_brands];
            updatedBrands[index] = { ...updatedBrands[index], [field]: value };
            return { ...prev, product_brands: updatedBrands };
        });
    };

    // 4. Guardar los cambios en Supabase
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
        const confirmed = window.confirm('¿Seguro que deseas eliminar este producto?');
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
                <img className={styles.mainProductImage} alt="Producto" src={product.imagen}/>
                <div className={styles.mainProductInfo}>
                    {isEditing ? (
                        /* VISTA EDICIÓN: INPUTS GENERALES */
                        <div className={styles.productDetails}>
                            <input
                                name="nombre"
                                className={`${styles.mainProductTitle} ${styles.editTitleInput}`}
                                value={formData.nombre}
                                onChange={handleProductChange}
                            />
                            <p className={styles.fieldRow}>
                                <strong>Numero de parte:</strong>
                                <input name="numero_parte" className={styles.editInput} value={formData.numero_parte} onChange={handleProductChange} />
                            </p>
                            <p className={styles.fieldColumn}>
                                <strong>Descripción:</strong>
                                <textarea name="descripcion" className={styles.editTextarea} value={formData.descripcion} onChange={handleProductChange} />
                            </p>
                            <p className={styles.fieldRow}>
                                <strong>Categoría:</strong>
                                <select name="categoria" className={styles.editSelect} value={formData.categoria} onChange={handleProductChange}>
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
                            <h2 className={styles.mainProductTitle}>{product.nombre}</h2>
                            <div className={styles.productDetails}>
                                <p><strong>Numero de parte:</strong> {product.numero_parte}</p>
                                <p><strong>Descripción:</strong> {product.descripcion}</p>
                                <p><strong>Categoría:</strong> {product.categoria}</p>
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
                    <caption>Inventario</caption>
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
                        {isEditing ? (
                            /* VISTA EDICIÓN: INPUTS FILAS DE TABLA */
                            formData.product_brands.map((brand, index) => (
                                <tr key={index}>
                                    <td>
                                        <input className={styles.tableInput} value={brand.marca} onChange={(e) => handleBrandChange(index, 'marca', e.target.value)} />
                                    </td>
                                    <td>
                                        $<input className={styles.tableInput} type="number" step="0.01" value={brand.precio1} onChange={(e) => handleBrandChange(index, 'precio1', e.target.value)} />
                                    </td>
                                    <td>
                                        $<input className={styles.tableInput} type="number" step="0.01" value={brand.precio2} onChange={(e) => handleBrandChange(index, 'precio2', e.target.value)} />
                                    </td>
                                    <td>
                                        <input className={styles.tableInput} type="number" value={brand.cantidad} onChange={(e) => handleBrandChange(index, 'cantidad', e.target.value)} />
                                    </td>
                                    <td>
                                        <select className={styles.tableSelect} value={brand.almacen} onChange={(e) => handleBrandChange(index, 'almacen', e.target.value)}>
                                            <option value="">Seleccionar</option>
                                            {storeOptions.map((store) => (
                                                <option key={store.id} value={store.id}>{store.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            /* VISTA LECTURA DE TABLA (ORIGINAL) */
                            productBrands.map((brand, index) => (
                                <tr key={index}>
                                    <td>{brand.marca}</td>
                                    <td>${formatCurrency(brand.precio1)}</td>
                                    <td>${formatCurrency(brand.precio2)}</td>
                                    <td>{brand.cantidad ?? 0}</td>
                                    <td>{getStoreLabel(brand.almacen || product.almacen)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
