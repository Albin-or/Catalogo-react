import { createContext, useContext } from 'react';
import { useFilters } from '../hooks/useFilters.jsx';
import allProducts from "../data/products.json"

const FiltersContext = createContext();

export function FiltersProvider({ children }) {
    const filters = useFilters(allProducts);
    return (
        <FiltersContext.Provider value={filters}>
            {children}
        </FiltersContext.Provider>
    );
}

export function useFiltersContext() {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error('useFiltersContext must be used within a FiltersProvider');
    }
    return context;
}