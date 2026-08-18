import { create } from 'zustand';

export const cleanText = (text = '') => {
  return text
  	.normalize('NFD')
  	.replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};
const normalizeValue = (value) => cleanText(String(value ?? ''));

function filterProducts(products, searchQuery, selectedCategories, selectedModels) {
  if (!Array.isArray(products)) {
    console.error('Expected products to be an array, but received:', products);
    return [];
  }
  if (!Array.isArray(selectedCategories)) {
    console.error('Expected selectedCategories to be an array, but received:', selectedCategories);
    return [];
  }
  if (!Array.isArray(selectedModels)) {
    console.error('Expected selectedModels to be an array, but received:', selectedModels);
    return [];
  }
  if (typeof searchQuery !== 'string') {
    console.error('Expected searchQuery to be a string, but received:', searchQuery);
    return [];
  }
  return products.filter(product => {
    const matchesSearch = searchQuery === '' || [
      product.name,
      product.part_number,
      product.description
    ].some(value => cleanText(value || '').includes(searchQuery));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(normalizeValue(product.category_id));
    const modelIds = [
      product.model_id,
      ...(Array.isArray(product.model_ids) ? product.model_ids : [])
    ].map(normalizeValue).filter(Boolean);
    const matchesModel = selectedModels.length === 0 || modelIds.some(modelId => selectedModels.includes(modelId));

    return matchesSearch && matchesCategory && matchesModel;
  });
}

let timerId = null;

export const useFiltersStore = create((set, get) => ({
	searchQuery: '',
	selectedCategories: [],
	selectedModels: [],
	currentPage: 1,
  products: [],
  filteredProducts: [],

  setProducts: (newProducts) => {
    if (typeof newProducts === 'function') {
      set(state => { 
        const resolvedProducts = newProducts(state.products);
        const nextFilteredProducts = filterProducts(
          resolvedProducts,
          state.searchQuery,
          state.selectedCategories,
          state.selectedModels
        );
        return {
          products: resolvedProducts,
          filteredProducts: nextFilteredProducts
        };
      });
    } else if (Array.isArray(newProducts)) {
      set(state => {
        const nextFilteredProducts = filterProducts(
          newProducts,
          state.searchQuery,
          state.selectedCategories,
          state.selectedModels
        );
        return {
          products: newProducts,
          filteredProducts: nextFilteredProducts
        };
      });
    }
    else {
      console.error('setProducts expects an array or a function that returns an array.');
    }
  },

  handlePageChange: (page) => {
    set({ currentPage: page });
  },

	handleCheckboxChange: (id, filterType) => {
    const currentSelection = get()[filterType];
    const cleanedId = cleanText(id);
    const updatedFilter = currentSelection.includes(cleanedId)
      ? currentSelection.filter(item => item !== cleanedId)
      : [...currentSelection, cleanedId];
    set(state => {
      const nextState = { [filterType]: updatedFilter, currentPage: 1 };
      const models = filterType === 'selectedModels' ? updatedFilter : state.selectedModels;
      const categories = filterType === 'selectedCategories' ? updatedFilter : state.selectedCategories;
      const nextFilteredProducts = filterProducts(
        state.products,
        state.searchQuery,
        categories,
        models
      );
      return {
        ...nextState,
        filteredProducts: nextFilteredProducts
      };
    })
  },

  handleInputChange: (e) => {
    const inputValue = cleanText(e.target.value);
    set({searchQuery: inputValue})
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() =>
      set((state) => {
      const nextFilteredProducts = filterProducts(
        state.products,
        inputValue,
        state.selectedCategories,
        state.selectedModels
      );
      return {
        filteredProducts: nextFilteredProducts,
        currentPage: 1
      };
    }), 500)
  },
}));