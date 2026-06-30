import { HomePage } from './pages/HomePage.jsx'
import { ItemPage } from './pages/ItemPage.jsx'
import styles from './App.module.css'
import { Navbar } from './components/Navbar.jsx'
import { FiltersProvider } from './components/FiltersContext.jsx'
import { Routes, Route } from 'react-router'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { AddItemPage } from './pages/AddItemPage.jsx'
import { RestockPage } from './pages/RestockPage.jsx'
import { DischargePage } from './pages/DischargePage.jsx'
import { InventoryProvider } from './hooks/useInventory.jsx'

function App() {
  return (
    <InventoryProvider>
      <FiltersProvider>
        <header className={styles.headerSticky}>
          <Navbar />
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ItemPage />} />
          <Route path="/addItem" element={<AddItemPage />} />
          <Route path="/restock" element={<RestockPage />} />
          <Route path="/discharge" element={<DischargePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </FiltersProvider>
    </InventoryProvider>
  );
}
export { App }
