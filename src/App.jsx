import { HomePage } from './pages/HomePage.jsx'
import { ItemPage } from './pages/ItemPage.jsx'
import styles from './components/App.module.css'
import { Navbar } from './components/Navbar.jsx'
import { FiltersProvider } from './components/FiltersContext.jsx'
import { Routes, Route } from 'react-router'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

function App() {
  return (
    <FiltersProvider>
      <header className={styles.headerSticky}>
        <Navbar />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ItemPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </FiltersProvider>
  );
}
export { App }
