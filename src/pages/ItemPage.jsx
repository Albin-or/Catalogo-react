import styles from './ItemPage.module.css'
import { useRouter } from '../hooks/useRouter.jsx';
import { useInventory } from '../hooks/useInventory.jsx';

export function ItemPage() {
    const { getQueryParam } = useRouter();
    const partId = getQueryParam('id');
    const { products } = useInventory();
    const product = products.find((p) => String(p.id) === String(partId));

    if (!product) {
        return <main><p>Product not found</p></main>;
    }

    return (
        <main>
            <section className={styles.mainProductCard}>
                <img className={styles.mainProductImage} alt="Pistones de Corolla 90-98" src={product.imagen}/>
                <div className={styles.mainProductInfo}>
                    <h2 className={styles.mainProductTitle}>{product.nombre}</h2>
                    <div className={styles.productDetails}>
                        <p><strong>Part Number:</strong> {product.numero_parte}</p>
                        <p><strong>Description:</strong> {product.descripcion}</p>
                        <p><strong>Category:</strong> {product.categoria}</p>
                    </div>
                </div>
            </section>
            <div className={styles.tableContainer}>
                <table>
                    <caption>Compatible Models</caption>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Chasis code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Corolla</td>
                            <td>1990-1998</td>
                            <td>AE101, AE102, AE111, AE112</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <caption>Equivalent Codes</caption>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Part Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Toyota</td>
                            <td>12345</td>
                        </tr>
                        <tr>
                            <td>Aftermarket</td>
                            <td>54321</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    )
}