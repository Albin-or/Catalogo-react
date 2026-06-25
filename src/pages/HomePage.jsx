import { useFiltersContext } from '../components/FiltersContext.jsx'
import styles from '../App.module.css'
import { Navbar } from '../components/Navbar.jsx'
import { Filters } from '../components/Filters.jsx'
import { ProductList } from '../components/ProductList.jsx'

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
    filteredProducts,
    handleCheckboxChange
  } = useFiltersContext();

  return (
    <>
    <main className={styles.content}>
      <Filters
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        handleCheckboxChange={handleCheckboxChange}
      />
      <ProductList products={filteredProducts} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </main>
    </>
  );
}