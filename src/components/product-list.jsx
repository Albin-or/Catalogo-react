import { useState, useMemo } from "react"
import "../styles/product-list.css"
import { ProductCard } from "./product-card.jsx"
import { Pagination } from "./pagination.jsx"

export function ProductList({ products }) {
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const totalPages = Math.ceil(products.length / productsPerPage);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        return products.slice(startIndex, startIndex + productsPerPage);
    }, [products, currentPage]);

    const productCards = currentProducts.map(product => <ProductCard key={product.id} product={product} />);

    return (
        <section className="products-grid">
            <h2>Resultados</h2>
            {productCards.length > 0 ? productCards : <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </section>
    )
}