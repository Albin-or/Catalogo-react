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

    const totalQuantity = Array.isArray(product?.product_brands)
        ? product.product_brands.reduce((sum, brand) => sum + Number(brand?.cantidad || 0), 0)
        : 0;

    return (
        <article className={styles.productCard}>
            <Link to={buildProductURL(product)} className={styles.productLink}>
                <Img className={styles.productImage} src={product.imagen} alt="Imagen del producto"/>
                <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.nombre}</h3>
                    <span className={styles.categoryTag}>{product.categoria}</span>
                    <data value={product.numero_parte} className={styles.partNumber}>Nº Parte: {product.numero_parte}</data>
                    <p className={styles.partNumber}>Cantidad: {totalQuantity}</p>
                    <footer className={styles.cardFooter}>
                        <span className={styles.viewDetails}>Ver detalle</span>
                    </footer>
                </div>
            </Link>
        </article>
    )
}