import styles from './App.module.css'
import { Navbar } from './components/Navbar.jsx'
import { FiltersProvider } from './components/FiltersContext.jsx'
import { Routes, Route } from 'react-router'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { InventoryProvider } from './hooks/useInventory.jsx'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage.jsx').then(module => ({ default: module.HomePage })))
const ItemPage = lazy(() => import('./pages/ItemPage.jsx').then(module => ({ default: module.ItemPage })))
const AddItemPage = lazy(() => import('./pages/AddItemPage.jsx').then(module => ({ default: module.AddItemPage })))
const RestockPage = lazy(() => import('./pages/RestockPage.jsx').then(module => ({ default: module.RestockPage })))
const DischargePage = lazy(() => import('./pages/DischargePage.jsx').then(module => ({ default: module.DischargePage })))

function App() {
  return (
    <InventoryProvider>
      <FiltersProvider>
        <header className={styles.headerSticky}>
          <Navbar />
        </header>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ItemPage />} />
            <Route path="/addItem" element={<AddItemPage />} />
            <Route path="/restock" element={<RestockPage />} />
            <Route path="/discharge" element={<DischargePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </FiltersProvider>
    </InventoryProvider>
  );
}
export { App }
