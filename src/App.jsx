import { useState, useMemo } from 'react'
import './styles/App.css'
import { Navbar } from './components/navbar.jsx'
import { Filters } from './components/filters.jsx'
import { ProductList } from './components/product-list.jsx'
import allProducts from "./data/products.json"

const cleanText = (text = '') => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

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
    <header className='headerSticky'>
      <Navbar onSearchChange={setSearchQuery} />
    </header>
    <main className="content">
      <Filters
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        cleanText={cleanText}
      />
      <ProductList products={filteredProducts} />
    </main>
    </>
  );
}
export { App }
