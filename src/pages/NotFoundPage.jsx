import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <main className={styles.notFoundPage}>
      <section className={styles.card}>
        <span className={styles.code}>404</span>
        <div className={styles.content}>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.description}>
            Lo siento, no pudimos encontrar la página que estás buscando.
          </p>
        </div>
      </section>
    </main>
  )
}
