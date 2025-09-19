// src/components/Pagination/Pagination.jsx
import React from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null; // hide if no pages

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className={styles.pagination}>
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={styles.pageBtn}
            >
                ◀ Prev
            </button>

            <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
            >
                Next ▶
            </button>
        </div>
    );
};

export default Pagination;
