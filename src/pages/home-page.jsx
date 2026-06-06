import { useFilters } from '../hooks/useFilters.jsx';
import styles from '../components/App.module.css'
import { Navbar } from '../components/navbar.jsx'
import { Filters } from '../components/filters.jsx'
import { ProductList } from '../components/product-list.jsx'
import allProducts from "../data/products.json"

export function HomePage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    selectedModels,
    setSelectedModels,
    currentPage,
    setCurrentPage,
    filteredProducts
  } = useFilters(allProducts);

  return (
    <>
    <header className={styles.headerSticky}>
      <Navbar onSearchChange={setSearchQuery} setCurrentPage={setCurrentPage} />
    </header>
    <main className={styles.content}>
      <Filters
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
      />
      <ProductList products={filteredProducts} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </main>
    </>
  );
}