import "../styles/product-list.css"
import ProductCard from "./product-card.jsx"

export default function ProductList({ products }) {
    const productCards = products.map(product => <ProductCard key={product.id} product={product} />)
    return (
        <section className="results">
                <div className="products-grid">
                    <h2>Resultados</h2>
                    {productCards.length > 0 ? productCards : <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>}
                </div>
                <div className="pagination"></div>
            </section>
    )
}