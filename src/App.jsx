import { HomePage } from './pages/HomePage.jsx'
import { ItemPage } from './pages/ItemPage.jsx'
import styles from './components/App.module.css'
import { Navbar } from './components/Navbar.jsx'
import { FiltersProvider } from './components/FiltersContext.jsx'
import { Route } from './components/Route.jsx'

function App() {
  return (
    <FiltersProvider>
      <header className={styles.headerSticky}>
        <Navbar />
      </header>
      <Route path="/" component={HomePage} />
      <Route path="/product" component={ItemPage} />
    </FiltersProvider>
  );
}
export { App }
