import { useState, useMemo, useRef, useEffect } from 'react';

export const cleanText = (text = '') => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

export function useFilters(allProducts) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const timeoutId = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCheckboxChange = (id, currentSelection, setSelection) => {
    const cleanedId = cleanText(id);  
      if (currentSelection.includes(cleanedId)) {
        setSelection(currentSelection.filter(item => item !== cleanedId));
      } else {
        setSelection([...currentSelection, cleanedId]);
      }
    };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1);
    }, 300);
  };

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
    [searchQuery, selectedCategories, selectedModels, allProducts]);

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [timeoutId]);

	return {
		searchQuery,
		setSearchQuery,
		selectedCategories,
		setSelectedCategories,
		selectedModels,
		setSelectedModels,
		currentPage,
		setCurrentPage,
		filteredProducts,
		handleCheckboxChange,
		handleInputChange
	};
}