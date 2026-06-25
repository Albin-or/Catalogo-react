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
    return (
        <article className={styles.productCard}>
            <Link to={buildProductURL(product)} className={styles.productLink}>
                <Img className={styles.productImage} src={product.imagen} alt="Imagen del producto"/>
                <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.nombre}</h3>
                    <span className={styles.categoryTag}>{product.categoria}</span>
                    <data value={product.numero_parte} className={styles.partNumber}>Nº Parte: {product.numero_parte}</data>
                    <p className={styles.description}>{product.descripcion}</p>
                    <footer className={styles.cardFooter}>
                        <span className={styles.viewDetails}>Ver detalle</span>
                    </footer>
                </div>
            </Link>
        </article>
    )
}