import styles from "./Filters.module.css";
import { cleanText } from '../hooks/useFilters.jsx'
import { useInventory } from '../hooks/useInventory.jsx'

export function Filters({ 
  selectedCategories,
  selectedModels,
  handleCheckboxChange
}) {
  const { categories, models, error } = useInventory();

  return (
    <aside className={styles.filters}>
      <h2>Filtros</h2>

      {error && (
        <div className={styles.errorBanner}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <h3>Categoría</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            <label>
              <input 
                type="checkbox" 
                name="category" 
                value={cat.id} 
                checked={selectedCategories.includes(cleanText(cat.id))}
                onChange={() => handleCheckboxChange(cat.id, selectedCategories, 'categories')}
              />
              <span className={styles.labelText}>{cat.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <h3>Modelos</h3>
      <ul>
        {models.map((model) => (
          <li key={model.id}>
            <label>
              <input 
                type="checkbox" 
                name="model" 
                value={model.id} 
                checked={selectedModels.includes(cleanText(model.id))}
                onChange={() => handleCheckboxChange(model.id, selectedModels, 'models')}
              />
              <span className={styles.labelText}>{model.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}
