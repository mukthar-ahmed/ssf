import React, { useEffect, useState, useCallback } from "react";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./TransactionTable.module.css";
import { jsPDF } from "jspdf";

function TransactionTable({
    transactions,
    loading,
    totalCount,
    totalPages,
    page,
    limit,
    selectionLabel,
    typeFilter,
    appliedSearch,
    onPageChange,
    onLimitChange,
    onApplySearch,
}) {
    const [searchId, setSearchId] = useState(appliedSearch ?? "");
    const [searchHint, setSearchHint] = useState("");
    const [highlightTxnId, setHighlightTxnId] = useState(null);

    useEffect(() => {
        setSearchId(appliedSearch ?? "");
        setSearchHint(appliedSearch ? `Searching within selection for "${appliedSearch}"` : "");
    }, [appliedSearch]);

    const formatINR = useCallback((value) => {
        const n = Number(value) || 0;
        const abs = Math.abs(n);
        return `${n < 0 ? "-" : ""}₹${abs.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }, []);

    const submitSearch = useCallback(() => {
        const q = (searchId || "").trim();
        onApplySearch(q);
        setHighlightTxnId(null);
        setSearchHint(q ? `Searching within selection for "${q}"` : "");
    }, [onApplySearch, searchId]);

    useEffect(() => {
        if (!appliedSearch || !transactions?.length) return;
        const exact = transactions.find((t) => String(t.id) === String(appliedSearch));
        if (!exact) return;

        const timer = setTimeout(() => {
            setHighlightTxnId(exact.id);
            const el = document.getElementById(`row-${exact.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 80);

        const clearTimer = setTimeout(() => setHighlightTxnId(null), 2200);
        return () => {
            clearTimeout(timer);
            clearTimeout(clearTimer);
        };
    }, [appliedSearch, transactions]);

    function generateReceipt(txnId) {
        const txn = transactions.find((t) => t.id === txnId);
        if (!txn) return alert("Transaction not found.");

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Payment Receipt", 105, 20, { align: "center" });

        let y = 40;
        const lineHeight = 10;

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${txn.id}`, 30, y);
        y += lineHeight;
        doc.text(`Type: ${txn.type.toUpperCase()}`, 30, y);
        y += lineHeight;
        doc.text(`Donor: ${txn.donor || "-"}`, 30, y);
        y += lineHeight;
        doc.text(`Amount: ${formatINR(txn.amount)}`, 30, y);
        y += lineHeight;
        doc.text(`Description: ${txn.description}`, 30, y);
        y += lineHeight;
        doc.text(`Date: ${txn.date}`, 30, y);

        doc.save(`receipt-${txn.id}.pdf`);
    }

    return (
        <div className={styles.transactionSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.titleGroup}>
                    <h2>Transaction History</h2>
                    <span className={styles.selectionInfo}>
                        Showing: <strong>{selectionLabel}</strong>
                        {typeFilter !== "all" ? ` • ${typeFilter}` : ""}
                        {appliedSearch ? ` • search: "${appliedSearch}"` : ""}
                    </span>
                </div>

                <div className={styles.searchBox}>
                    <div className={styles.searchFieldWrap}>
                        <svg
                            className={styles.searchIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            className={styles.searchInput}
                            placeholder="Search (txnId / description / donor / amount)"
                            value={searchId}
                            onChange={(e) => {
                                setSearchId(e.target.value);
                                setSearchHint("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitSearch();
                                if (e.key === "Escape") {
                                    setSearchId("");
                                    setSearchHint("");
                                    onApplySearch("");
                                }
                            }}
                        />
                        {searchId && (
                            <button
                                className={styles.searchClear}
                                onClick={() => {
                                    setSearchId("");
                                    setSearchHint("");
                                    onApplySearch("");
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button className={styles.searchBtn} onClick={submitSearch}>
                        Search
                    </button>
                    <span className={styles.resultBadge}>
                        {`${totalCount} result${totalCount === 1 ? "" : "s"}`}
                    </span>
                </div>
            </div>

            {searchHint && <p className={styles.searchHint}>{searchHint}</p>}

            {/* entire table scrolls horizontally */}
            <div className={styles.transactionBody}>
                <div className={styles.transactionHeader}>
                    <span>ID</span>
                    <span>Description</span>
                    <span>Donor</span>
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Receipt</span>
                </div>

                {loading && <div className={styles.emptyState}><p>Loading…</p></div>}

                {!loading && transactions.map((transaction) => (
                    <div
                        id={`row-${transaction.id}`}
                        className={`${styles.transactionItem} ${highlightTxnId === transaction.id ? styles.highlightRow : ""
                            }`}
                        key={transaction.id}
                    >
                        <span className={styles.transactionId} title={transaction.id}>{transaction.id}</span>
                        <span className={styles.transactionDesc}>{transaction.description}</span>
                        <span className={styles.transactionDonor}>{transaction.donor}</span>
                        <span className={styles.transactionDate}>{transaction.date}</span>
                        <span
                            className={`${styles.transactionAmount} ${transaction.type === "income" ? styles.income : styles.expense
                                }`}
                        >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatINR(Math.abs(transaction.amount))}
                        </span>
                        <span>
                            <button
                                className={styles.generateBtn}
                                onClick={() => generateReceipt(transaction.id)}
                            >
                                Generate
                            </button>
                        </span>
                    </div>
                ))}

                {!loading && transactions.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No transactions match your selection.</p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                limit={limit}
                onLimitChange={(val) => {
                    onLimitChange(val);
                    onPageChange(1);
                }}
            />
        </div>
    );
}

export default TransactionTable;
