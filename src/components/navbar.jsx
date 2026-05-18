import logo from '../assets/logo.svg'
import searchIcon from '../assets/search-icon.svg'
import '../styles/navbar.css'

export default function Navbar({ onSearchChange }) {
  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }
  const handleInputChange = (e) => {
    onSearchChange(e.target.value)
  }
  return (
    <nav className="navigation">
        <div className="logo">
            <img src={logo} alt="Toyocars - Repuestos originales Toyota"/>
        </div>

        <form className="search" onSubmit={handleSearchSubmit}>
            <span className="search-icon" aria-hidden="true">
                <img src={searchIcon} alt=""/>
            </span>
            
            <input 
              id="search-parts"
              type="search" 
              placeholder="Número de pieza / Descripción / Categoría"
              aria-label="Buscar repuestos Toyota"
              onChange={handleInputChange}
            />
            
            <button type="submit">Buscar</button>
        </form>
    </nav>
  )
}
