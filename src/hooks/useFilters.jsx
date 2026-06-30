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

  const normalizeValue = (value) => cleanText(String(value ?? ''));
  const searchQuery = searchParams.get('search') || '';
  const selectedCategories = searchParams.get('categories') ? searchParams.get('categories').split(',').map(normalizeValue) : [];
  const selectedModels = searchParams.get('models') ? searchParams.get('models').split(',').map(normalizeValue) : [];
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
      const normalizedSearch = cleanText(searchQuery);
      const matchesSearch = normalizedSearch === '' || [
        product.name,
        product.part_number,
        product.description
      ].some(value => cleanText(value || '').includes(normalizedSearch));

      const productCategoryId = normalizeValue(product.category_id);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategoryId);

      const modelIds = [
        product.model_id,
        ...(Array.isArray(product.model_ids) ? product.model_ids : [])
      ].map(normalizeValue).filter(Boolean);
      const matchesModel = selectedModels.length === 0 || modelIds.some(modelId => selectedModels.includes(modelId));

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