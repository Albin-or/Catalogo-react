import logo from '../assets/logo.svg'
import searchIcon from '../assets/search-icon.svg'
import styles from './Navbar.module.css'
import { useFiltersStore, cleanText } from '../stores/useFiltersStore.js'
import { NavLink, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import addItemIcon from '../assets/addItem.svg'
import restockIcon from '../assets/charge.svg'
import dischargeIcon from '../assets/discharge.svg'

export function Navbar() {
  const searchQuery = useFiltersStore((state) => state.searchQuery);
  const handleInputChange = useFiltersStore((state) => state.handleInputChange);
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }
  const navigate = useNavigate();

  return (
    <nav className={styles.navigation}>
      <NavLink to="/" className={styles.logo}>
        <img src={logo} alt="Toyocars - Repuestos originales Toyota"/>
      </NavLink>

      <form className={styles.search} onSubmit={handleSearchSubmit}>
        <span className={styles.searchIcon} aria-hidden="true">
          <img src={searchIcon} alt=""/>
        </span>

        <input
          value={searchQuery}
          id="search-parts"
          type="search"
          placeholder="Número de pieza / Descripción / Categoría"
          aria-label="Buscar repuestos Toyota"
          onChange={handleInputChange}
        />

        <button type="submit">Buscar</button>
      </form>

      <div className={styles.buttonGroup}>
        <NavLink to="/restock" className={({ isActive }) => isActive ? `${styles.actionButton} ${styles.activeActionButton}` : styles.actionButton}>
          <img src={restockIcon} alt="Cargo" />
          Cargo
        </NavLink>
        <NavLink to="/discharge" className={({ isActive }) => isActive ? `${styles.actionButton} ${styles.activeActionButton}` : styles.actionButton}>
          <img src={dischargeIcon} alt="Descargo" />
          Descargo
        </NavLink>
        <NavLink to="/addItem" className={({ isActive }) => isActive ? `${styles.actionButton} ${styles.activeActionButton}` : styles.actionButton}>
          <img src={addItemIcon} alt="Añadir Producto" />
          Añadir Producto
        </NavLink>
      </div>
    </nav>
  )
}
