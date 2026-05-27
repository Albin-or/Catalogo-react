import "../styles/pagination.css";

export function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination-container">
            <button 
            className="pagination-nav"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 20l-3 -8l3 -8" /></svg>
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`pagination-button ${number === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </button>
            ))}
            <button 
            className="pagination-nav"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-compact-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11 4l3 8l-3 8" /></svg>
            </button>
        </div>
    );
}