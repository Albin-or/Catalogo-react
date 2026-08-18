import { useState, useMemo } from "react"
import { useFiltersStore } from "../stores/useFiltersStore.js"
import styles from "./ProductList.module.css"
import { ProductCard } from "./ProductCard.jsx"
import { Pagination } from "./Pagination.jsx"

export function ProductList() {
    const products = useFiltersStore((state) => state.filteredProducts);
    const currentPage = useFiltersStore((state) => state.currentPage);
    const productsPerPage = 12;
    const totalPages = Math.ceil(products.length / productsPerPage);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        return products.slice(startIndex, startIndex + productsPerPage);
    }, [products, currentPage]);

    const productCards = currentProducts.map(product => <ProductCard key={product.id} product={product} />);

    return (
        <section className={styles.productsGrid}>
            <h2>Resultados</h2>
            {productCards.length > 0 ? productCards : <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>}
            <Pagination totalPages={totalPages} />
        </section>
    )
}