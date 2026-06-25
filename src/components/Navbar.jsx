import logo from '../assets/logo.svg'
import searchIcon from '../assets/search-icon.svg'
import styles from './Navbar.module.css'
import { useFiltersContext } from './FiltersContext.jsx'
import { Link } from './Link.jsx'

export function Navbar() {
  const { searchQuery, handleInputChange } = useFiltersContext();
  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <nav className={styles.navigation}>
      <Link to="/" className={styles.logo}>
        <img src={logo} alt="Toyocars - Repuestos originales Toyota"/>
      </Link>

        <form className={styles.search} onSubmit={handleSearchSubmit}>
            <span className={styles.searchIcon} aria-hidden="true">
                <img src={searchIcon} alt=""/>
            </span>
            
            <input 
              defaultValue={searchQuery}
              id="search-parts"
              type="search" 
              placeholder="Número de pieza / Descripción / Categoría"
              aria-label="Buscar repuestos Toyota"
              onChange={handleInputChange}
            />
            
            <button type="submit">Buscar</button>
        </form>
      <Link to="/addItem" className={styles.addItemButton}>Añadir Producto</Link>
    </nav>
  )
}
