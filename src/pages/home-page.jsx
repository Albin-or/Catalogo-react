import { useState, useMemo } from 'react'
import styles from '../components/App.module.css'
import { Navbar } from '../components/navbar.jsx'
import { Filters } from '../components/filters.jsx'
import { ProductList } from '../components/product-list.jsx'
import allProducts from "../data/products.json"

const cleanText = (text = '') => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => 
      allProducts.filter(product => {
      const matchesSearch = searchQuery === '' || 
      cleanText(product.nombre).includes(cleanText(searchQuery)) ||
      cleanText(product.numero_parte || '').includes(cleanText(searchQuery)) ||
      cleanText(product.descripcion || '').includes(cleanText(searchQuery));

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(cleanText(product.categoria));
      
      const matchesModel = selectedModels.length === 0 || selectedModels.includes(cleanText(product.modelo));
      
      return matchesSearch && matchesCategory && matchesModel;
    }),
    [searchQuery, selectedCategories, selectedModels]);
    
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
        cleanText={cleanText}
      />
      <ProductList products={filteredProducts} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </main>
    </>
  );
}