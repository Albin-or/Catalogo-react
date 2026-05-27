import "../styles/product-card.css"

export function ProductCard({ product }) {
    return (
        <article className="product-card">
            <a href={product.url} className="product-link">
                <img className="product-image" src={product.imagen} alt="Imagen del producto"/>
                <div className="product-info">
                    <h3 className="product-title">{product.nombre}</h3>
                    <span className="category-tag">{product.categoria}</span>
                    <data value={product.numero_parte} className="part-number">Nº Parte: {product.numero_parte}</data>
                    <p className="description">{product.descripcion}</p>
                    <footer className="card-footer">
                        <span className="view-details">Ver detalle</span>
                    </footer>
                </div>
            </a>
        </article>
    )
}