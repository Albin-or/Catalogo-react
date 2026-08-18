import styles from '../App.module.css'
import { Navbar } from '../components/Navbar.jsx'
import { Filters } from '../components/Filters.jsx'
import { ProductList } from '../components/ProductList.jsx'

export function HomePage() {
  return (
    <main className={styles.content}>
      <Filters />
      <ProductList />
    </main>
  );
}