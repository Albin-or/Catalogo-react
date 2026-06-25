import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';

export const cleanText = (text = '') => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

export function useFilters(allProducts) {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const selectedCategories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
  const selectedModels = searchParams.get('models') ? searchParams.get('models').split(',') : [];
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;

  const timeoutId = useRef(null);

  const updateSearchParams = (key, value) => {
    setSearchParams(params => {
      const newParams = new URLSearchParams(params);
      if (value && value.length > 0) {
        newParams.set(key, Array.isArray(value) ? value.join(',') : value);
        
      }
      else {
        newParams.delete(key);
      }
      if (key !== 'page') {
        newParams.delete('page');
      }
      return newParams;
    });
  };

  const handleCheckboxChange = (id, currentSelection, filterType) => {
    const cleanedId = cleanText(id);  
      if (currentSelection.includes(cleanedId)) {
        updateSearchParams(filterType, currentSelection.filter(item => item !== cleanedId));
      } else {
        updateSearchParams(filterType, [...currentSelection, cleanedId]);
      }
    };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      updateSearchParams('search', inputValue);
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
		selectedCategories,
		selectedModels,
		currentPage,
		filteredProducts,
    updateSearchParams,
		handleCheckboxChange,
		handleInputChange
	};
}