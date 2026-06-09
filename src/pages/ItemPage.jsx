import styles from './ItemPage.module.css'

export function ItemPage() {
    return (
        <main>
            <section className={styles.mainProductCard}>
                <img className={styles.mainProductImage} alt="Pistones de Corolla 90-98" src="https://http2.mlstatic.com/D_NQ_NP_990338-MLV81142267754_122024-O.webp"/>
                <div className={styles.mainProductInfo}>
                    <h2 className={styles.mainProductTitle}>Pistones de Corolla 90-98</h2>
                    <div className={styles.productDetails}>
                        <p><strong>Part Number:</strong> 12345</p>
                        <p><strong>Description:</strong> Pistones de Corolla 90-98</p>
                        <p><strong>Category:</strong> Motor</p>
                    </div>
                </div>
            </section>
            <div className={styles.tableContainer}>
                <table>
                    <caption>Compatible Models</caption>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Chasis code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Corolla</td>
                            <td>1990-1998</td>
                            <td>AE101, AE102, AE111, AE112</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <caption>Equivalent Codes</caption>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Part Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Toyota</td>
                            <td>12345</td>
                        </tr>
                        <tr>
                            <td>Aftermarket</td>
                            <td>54321</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    )
}