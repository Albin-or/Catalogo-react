import styles from "./ProductCard.module.css"
import { Link } from "./Link.jsx"
import { Img } from "./Img.jsx"

export function ProductCard({ product }) {
    const buildProductURL = (product) => {
        const url = new URL(window.location.href);
        url.pathname = `/product`;
        url.searchParams.set('id', product.id);
        return url.pathname + url.search;
    }

    const totalQuantity = Array.isArray(product?.product_stocks)
        ? product.product_stocks.reduce((sum, stock) => sum + Number(stock?.quantity || 0), 0)
        : 0;

    return (
        <article className={styles.productCard}>
            <Link to={buildProductURL(product)} className={styles.productLink}>
                <Img className={styles.productImage} src={product.image_url} alt={product.name || 'Imagen del producto'} />
                <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <span className={styles.categoryTag}>{product.category_id || 'Sin categoría'}</span>
                    <data value={product.part_number} className={styles.partNumber}>Nº Parte: {product.part_number}</data>
                    <p className={styles.partNumber}>Cantidad: {totalQuantity}</p>
                    <footer className={styles.cardFooter}>
                        <span className={styles.viewDetails}>Ver detalle</span>
                    </footer>
                </div>
            </Link>
        </article>
    )
}