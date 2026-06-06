import styles from "./Filters.module.css";
import { cleanText } from '../hooks/useFilters.jsx'

export function Filters({ 
  selectedCategories, 
  setSelectedCategories, 
  selectedModels, 
  setSelectedModels,
}) {

  const categories = [
    { id: "mangueras", label: "Mangueras" },
    { id: "motor", label: "Motor" },
    { id: "frenos", label: "Frenos" },
    { id: "suspension", label: "Suspensión" },
    { id: "electrico", label: "Eléctrico" },
  ];

  const models = [
    { id: "corolla", label: "Corolla" },
    { id: "yaris", label: "Yaris" },
    { id: "camry", label: "Camry" },
  ];

  const handleCheckboxChange = (id, currentSelection, setSelection) => {
    const cleanedId = cleanText(id);
    
    if (currentSelection.includes(cleanedId)) {
      setSelection(currentSelection.filter(item => item !== cleanedId));
    } else {
      setSelection([...currentSelection, cleanedId]);
    }
  };

  return (
    <aside className={styles.filters}>
      <h2>Filtros</h2>

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
                onChange={() => handleCheckboxChange(cat.id, selectedCategories, setSelectedCategories)}
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
                onChange={() => handleCheckboxChange(model.id, selectedModels, setSelectedModels)}
              />
              <span className={styles.labelText}>{model.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}
