import styles from "./Pagination.module.css";
import { useRouter } from "../hooks/useRouter.jsx";

export function Pagination({ currentPage, totalPages, onPageChange }) {
    const { navigateTo } = useRouter();
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    const buildPageURL = (page) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        return url.pathname + url.search;
    }

    return (
        <div className={styles.paginationContainer}>
            <button 
            className={styles.paginationNav}
            disabled={currentPage === 1}
            onClick={() => {
                onPageChange(currentPage - 1);
                navigateTo(buildPageURL(currentPage - 1));
            }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 20l-3 -8l3 -8" /></svg>
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`${styles.paginationButton} ${number === currentPage ? styles.active : ''}`}
                    onClick={() => {
                        onPageChange(number);
                        navigateTo(buildPageURL(number));
                    }}
                >
                    {number}
                </button>
            ))}
            <button 
            className={styles.paginationNav}
            disabled={currentPage === totalPages}
            onClick={() => {
                onPageChange(currentPage + 1);
                navigateTo(buildPageURL(currentPage + 1));
            }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11 4l3 8l-3 8" /></svg>
            </button>
        </div>
    );
}