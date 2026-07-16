import { createContext, useContext } from 'react';
import { useFilters } from '../hooks/useFilters.jsx';
import { useInventory } from "../hooks/useInventory.jsx";

const FiltersContext = createContext();

export function FiltersProvider({ children }) {
    const { products } = useInventory();
    const filters = useFilters(products);
    return (
        <FiltersContext value={filters}>
            {children}
        </FiltersContext>
    );
}

export function useFiltersContext() {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error('useFiltersContext must be used within a FiltersProvider');
    }
    return context;
}