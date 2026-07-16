import styles from "./Pagination.module.css";
import { useFiltersContext } from "./FiltersContext.jsx";

export function Pagination({ totalPages }) {
    const { currentPage, updateSearchParams } = useFiltersContext();
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    const handlePageChange = (page) => {
        updateSearchParams('page', page.toString());
    }

    return (
        <div className={styles.paginationContainer}>
            <button 
            className={styles.paginationNav}
            disabled={currentPage === 1}
            onClick={() => {
                handlePageChange(currentPage - 1);
            }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 20l-3 -8l3 -8" /></svg>
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`${styles.paginationButton} ${number === currentPage ? styles.active : ''}`}
                    onClick={() => {
                        handlePageChange(number);
                    }}
                >
                    {number}
                </button>
            ))}
            <button 
            className={styles.paginationNav}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11 4l3 8l-3 8" /></svg>
            </button>
        </div>
    );
}