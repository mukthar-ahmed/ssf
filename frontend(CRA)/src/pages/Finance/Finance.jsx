// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import Pagination from "../../components/Pagination/Pagination";
// import styles from "./Finance.module.css";
// import { jsPDF } from "jspdf";
// import {
//     getTransactions as apiGetTransactions,
//     createTransaction as apiCreateTransaction,
//     getProfile as apiGetProfile,
// } from "../../api/internal";

// function Finance() {
//     // --- helper to format INR with 2 decimals and sign handling
//     function formatINR(value) {
//         const n = Number(value) || 0;
//         const abs = Math.abs(n);
//         const formatted = abs.toLocaleString("en-IN", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         });
//         return `${n < 0 ? "-" : ""}₹${formatted}`;
//     }

//     // --- user / role (to gate admin-only actions)
//     const [user, setUser] = useState(null);

//     // --- data & loading
//     const [transactions, setTransactions] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // --- server-driven summary & pagination
//     const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
//     const [totalCount, setTotalCount] = useState(0);
//     const [totalPages, setTotalPages] = useState(1);
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(10);

//     // --- filter state (mirrors backend API)
//     const monthsShort = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//     ];
//     const currentYear = new Date().getFullYear();

//     const [filterOpen, setFilterOpen] = useState(false);
//     const [filterScope, setFilterScope] = useState("all"); // 'all' | 'year' | 'month'
//     const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'income' | 'expense'
//     const [selectedYear, setSelectedYear] = useState(currentYear);
//     const [selectedMonth, setSelectedMonth] = useState(null); // 0..11 or null

//     // search: apply only when submitted (not on every keypress)
//     const [searchId, setSearchId] = useState("");
//     const [appliedSearch, setAppliedSearch] = useState("");
//     const [searchHint, setSearchHint] = useState("");
//     const [highlightTxnId, setHighlightTxnId] = useState(null);

//     // stable list of years (last 10 years incl. current)
//     const years = useMemo(() => {
//         return Array.from({ length: 10 }, (_, i) => currentYear - i);
//     }, [currentYear]);

//     // keep month selection sensible when scope changes
//     useEffect(() => {
//         if (filterScope !== "month") {
//             setSelectedMonth(null);
//         }
//     }, [filterScope]);

//     // --- selection label
//     const selectionLabel = useMemo(() => {
//         if (filterScope === "all") return "All time";
//         if (filterScope === "year") return `${selectedYear}`;
//         if (filterScope === "month")
//             return `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`;
//         return "All time";
//     }, [filterScope, selectedYear, selectedMonth]);

//     // --- fetch logged-in user for role gating
//     useEffect(() => {
//         let alive = true;
//         (async () => {
//             try {
//                 const res = await apiGetProfile();
//                 if (alive) setUser(res?.data?.user || null);
//             } catch (_) {
//                 // ignore - user may be unauthenticated
//             }
//         })();
//         return () => {
//             alive = false;
//         };
//     }, []);

//     // --- build params for backend
//     const buildParams = useCallback(() => {
//         const params = { page, limit };

//         // scope
//         if (filterScope === "year") {
//             params.scope = "year";
//             params.year = selectedYear;
//         } else if (filterScope === "month") {
//             params.scope = "month";
//             params.year = selectedYear;
//             if (selectedMonth !== null && selectedMonth !== undefined) {
//                 params.month = selectedMonth;
//             }
//         } else {
//             params.scope = "all";
//         }

//         // type
//         if (typeFilter === "income" || typeFilter === "expense") {
//             params.type = typeFilter;
//         }

//         // search (server searches description, donor, txnId, amount)
//         if (appliedSearch.trim()) {
//             params.search = appliedSearch.trim();
//         }

//         return params;
//     }, [page, limit, filterScope, selectedYear, selectedMonth, typeFilter, appliedSearch]);

//     // --- load transactions from server based on current filters
//     const loadTransactions = useCallback(async () => {
//         setLoading(true);
//         try {
//             const params = buildParams();
//             const res = await apiGetTransactions(params);
//             const data = res?.data || {};

//             const list = Array.isArray(data.transactions) ? data.transactions : [];
//             setTransactions(
//                 list.map((t) => ({
//                     id: t.txnId || t._id,
//                     type: t.type,
//                     amount: t.amount,
//                     description: t.description,
//                     donor: t.donor,
//                     date: t.date,
//                     timestamp: t.timestamp,
//                 }))
//             );

//             // summary & pagination (server-provided)
//             const s = data.summary || { income: 0, expense: 0, balance: 0 };
//             setSummary({
//                 income: Number(s.income) || 0,
//                 expense: Number(s.expense) || 0,
//                 balance: Number(s.balance) || 0,
//             });

//             setTotalCount(Number(data.totalCount) || list.length || 0);
//             setTotalPages(Number(data.totalPages) || 1);
//         } catch (err) {
//             // in case of error, show empty but don't crash UI
//             setTransactions([]);
//             setSummary({ income: 0, expense: 0, balance: 0 });
//             setTotalCount(0);
//             setTotalPages(1);
//         } finally {
//             setLoading(false);
//         }
//     }, [buildParams]);

//     // initial + whenever filters change
//     useEffect(() => {
//         let alive = true;
//         (async () => {
//             await loadTransactions();
//         })();
//         return () => {
//             alive = false;
//         };
//     }, [loadTransactions]);

//     // --- Add Transaction (admin only in UI; backend enforces too)
//     const [modalOpen, setModalOpen] = useState(false);
//     const [form, setForm] = useState({
//         type: "income",
//         amount: "",
//         description: "",
//         donor: "",
//         date: new Date().toISOString().split("T")[0],
//     });

//     function handleFormChange(e) {
//         const { name, value } = e.target;
//         setForm((f) => ({ ...f, [name]: value }));
//     }
//     function clearForm() {
//         setForm({
//             type: "income",
//             amount: "",
//             description: "",
//             donor: "",
//             date: new Date().toISOString().split("T")[0],
//         });
//     }
//     function openAddModal() {
//         setModalOpen(true);
//     }
//     function closeAddModal() {
//         setModalOpen(false);
//         clearForm();
//     }

//     async function addTransaction() {
//         const amount = parseFloat(form.amount);
//         if (!amount || amount <= 0) return alert("Please enter a valid amount");
//         if (!form.description.trim()) return alert("Please enter a description");
//         if (!form.donor || !form.donor.trim()) return alert("Please enter a donor");
//         if (!form.date) return alert("Please select a date");

//         try {
//             await apiCreateTransaction({
//                 type: form.type,
//                 amount,
//                 description: form.description.trim(),
//                 donor: form.donor.trim(),
//                 date: form.date,
//                 timestamp: new Date(form.date).getTime(),
//             });

//             // refresh current view using existing filters
//             await loadTransactions();

//             // focus UI around this month for better UX
//             const d = new Date(form.date);
//             setSelectedYear(d.getFullYear());
//             setSelectedMonth(d.getMonth());
//             setFilterScope("month");
//             setTypeFilter("all");
//         } catch (err) {
//             if (err?.response?.status === 403) {
//                 alert("You don’t have permission to add transactions.");
//             } else {
//                 alert("Failed to save transaction.");
//             }
//         }

//         closeAddModal();
//     }

//     // --- Search submit (server-side)
//     const submitSearch = () => {
//         const q = searchId.trim();
//         setSearchHint("");
//         setHighlightTxnId(null);

//         // apply & reload
//         setAppliedSearch(q);

//         if (q) {
//             setSearchHint(`Searching within selection for "${q}"`);
//             // reset to page 1 for new search
//             setPage(1);
//         }
//     };

//     // --- Highlight scroll into view (best-effort on this page)
//     useEffect(() => {
//         if (!highlightTxnId) return;
//         const timer = setTimeout(() => {
//             const el = document.getElementById(`row-${highlightTxnId}`);
//             if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
//         }, 50);

//         const clearTimer = setTimeout(() => setHighlightTxnId(null), 2200);
//         return () => {
//             clearTimeout(timer);
//             clearTimeout(clearTimer);
//         };
//     }, [highlightTxnId]);

//     // Filter popover outside click handling
//     const filterRef = useRef(null);
//     const filterBtnRef = useRef(null);
//     useEffect(() => {
//         function handleDocClick(e) {
//             if (!filterOpen) return;
//             if (filterRef.current && filterRef.current.contains(e.target)) return;
//             if (filterBtnRef.current && filterBtnRef.current.contains(e.target)) return;
//             setFilterOpen(false);
//         }
//         document.addEventListener("mousedown", handleDocClick);
//         return () => document.removeEventListener("mousedown", handleDocClick);
//     }, [filterOpen]);

//     return (
//         <div className={styles.dashboard}>
//             {/* Header */}
//             <div className={styles.dashboardHeader}>
//                 <div className={styles.headerLeft}>
//                     <h1>Finance Dashboard</h1>
//                     <p className={styles.subtle}>Track income &amp; expenses across years.</p>
//                 </div>

//                 {/* Admin-only: Add Transaction */}
//                 {user?.role === "admin" && (
//                     <button className={styles.addBtn} onClick={openAddModal}>
//                         +<span className={styles.btnText}>Add Transaction</span>
//                     </button>
//                 )}
//             </div>

//             {/* Insights with filter popover */}
//             <div className={styles.insightsCard}>
//                 <div className={styles.sectionHeader}>
//                     <h2>Insights</h2>
//                     <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                         <div style={{ textAlign: "right", fontSize: 13, color: "#64748b" }}>
//                             <div>{selectionLabel}</div>
//                             <div style={{ fontSize: 12 }}>
//                                 Type: {typeFilter === "all" ? "All" : typeFilter}
//                             </div>
//                         </div>

//                         <div style={{ position: "relative" }}>
//                             <button
//                                 ref={filterBtnRef}
//                                 className={styles.filterBtn}
//                                 onClick={() => setFilterOpen((s) => !s)}
//                                 aria-expanded={filterOpen}
//                             >
//                                 Filter
//                             </button>

//                             {filterOpen && (
//                                 <div
//                                     ref={filterRef}
//                                     className={styles.filterPopover}
//                                     role="dialog"
//                                     aria-label="Filter transactions"
//                                 >
//                                     <div className={styles.popRow}>
//                                         <label className={styles.popLabel}>Type</label>
//                                         <select
//                                             value={typeFilter}
//                                             onChange={(e) => setTypeFilter(e.target.value)}
//                                             className={styles.formInput}
//                                         >
//                                             <option value="all">All Types</option>
//                                             <option value="income">Income Only</option>
//                                             <option value="expense">Expenses Only</option>
//                                         </select>
//                                     </div>

//                                     <div className={styles.popRow}>
//                                         <label className={styles.popLabel}>Scope</label>
//                                         <div className={styles.scopeOptions}>
//                                             <label>
//                                                 <input
//                                                     type="radio"
//                                                     name="scope"
//                                                     value="all"
//                                                     checked={filterScope === "all"}
//                                                     onChange={() => {
//                                                         setFilterScope("all");
//                                                         setSelectedMonth(null);
//                                                         setPage(1);
//                                                     }}
//                                                 />{" "}
//                                                 All time
//                                             </label>
//                                             <label>
//                                                 <input
//                                                     type="radio"
//                                                     name="scope"
//                                                     value="year"
//                                                     checked={filterScope === "year"}
//                                                     onChange={() => {
//                                                         setFilterScope("year");
//                                                         setPage(1);
//                                                     }}
//                                                 />{" "}
//                                                 Year
//                                             </label>
//                                             <label>
//                                                 <input
//                                                     type="radio"
//                                                     name="scope"
//                                                     value="month"
//                                                     checked={filterScope === "month"}
//                                                     onChange={() => {
//                                                         setFilterScope("month");
//                                                         setPage(1);
//                                                     }}
//                                                 />{" "}
//                                                 Month
//                                             </label>
//                                         </div>
//                                     </div>

//                                     {(filterScope === "year" || filterScope === "month") && (
//                                         <div className={styles.popRow}>
//                                             <label className={styles.popLabel}>Year</label>
//                                             <select
//                                                 value={selectedYear}
//                                                 onChange={(e) => {
//                                                     setSelectedYear(parseInt(e.target.value, 10));
//                                                     setPage(1);
//                                                 }}
//                                                 className={styles.formInput}
//                                             >
//                                                 {years.map((y) => (
//                                                     <option key={y} value={y}>
//                                                         {y}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     )}

//                                     {filterScope === "month" && (
//                                         <div className={styles.popRow}>
//                                             <label className={styles.popLabel}>Month</label>
//                                             <select
//                                                 value={selectedMonth ?? ""}
//                                                 onChange={(e) => {
//                                                     setSelectedMonth(
//                                                         e.target.value === "" ? null : parseInt(e.target.value, 10)
//                                                     );
//                                                     setPage(1);
//                                                 }}
//                                                 className={styles.formInput}
//                                             >
//                                                 <option value="">--Select month--</option>
//                                                 {monthsShort.map((m, i) => (
//                                                     <option key={i} value={i}>
//                                                         {m}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     )}

//                                     <div className={styles.popActions}>
//                                         <button
//                                             className={styles.cancelBtn}
//                                             onClick={() => setFilterOpen(false)}
//                                         >
//                                             Close
//                                         </button>
//                                         <button
//                                             className={styles.submitBtn}
//                                             onClick={() => {
//                                                 setFilterOpen(false);
//                                                 // applying filter just closes the popover; effect will auto refetch
//                                             }}
//                                         >
//                                             Apply
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Summary (from server) */}
//                 <div className={styles.insightSummary}>
//                     <div className={styles.statPill}>
//                         <span>
//                             Income (
//                             {filterScope === "all"
//                                 ? "All time"
//                                 : filterScope === "year"
//                                     ? selectedYear
//                                     : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
//                             )
//                         </span>
//                         <strong>{formatINR(summary.income)}</strong>
//                     </div>
//                     <div className={styles.statPill}>
//                         <span>
//                             Expenses (
//                             {filterScope === "all"
//                                 ? "All time"
//                                 : filterScope === "year"
//                                     ? selectedYear
//                                     : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
//                             )
//                         </span>
//                         <strong>{formatINR(summary.expense)}</strong>
//                     </div>
//                     <div className={styles.statPill}>
//                         <span>
//                             Balance (
//                             {filterScope === "all"
//                                 ? "All time"
//                                 : filterScope === "year"
//                                     ? selectedYear
//                                     : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
//                             )
//                         </span>
//                         <strong>{formatINR(summary.balance)}</strong>
//                     </div>
//                 </div>
//             </div>

//             {/* Transactions + Search */}
//             <div className={styles.transactionSection}>
//                 <div className={styles.sectionHeader}>
//                     <div className={styles.titleGroup}>
//                         <h2>Transaction History</h2>
//                         <span className={styles.selectionInfo}>
//                             Showing: <strong>{selectionLabel}</strong>
//                             {typeFilter !== "all" ? ` • ${typeFilter}` : ""}
//                             {appliedSearch ? ` • search: "${appliedSearch}"` : ""}
//                         </span>
//                     </div>

//                     <div className={styles.searchBox}>
//                         <div className={styles.searchFieldWrap}>
//                             <svg
//                                 className={styles.searchIcon}
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth="2"
//                                 aria-hidden="true"
//                             >
//                                 <circle cx="11" cy="11" r="8"></circle>
//                                 <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
//                             </svg>
//                             <input
//                                 className={styles.searchInput}
//                                 placeholder="Search (txnId / description / donor / amount)"
//                                 aria-label="Search transactions"
//                                 value={searchId}
//                                 onChange={(e) => {
//                                     setSearchId(e.target.value);
//                                     setSearchHint("");
//                                 }}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter") submitSearch();
//                                     if (e.key === "Escape") {
//                                         setSearchId("");
//                                         setAppliedSearch("");
//                                         setSearchHint("");
//                                         setPage(1);
//                                     }
//                                 }}
//                             />
//                             {searchId && (
//                                 <button
//                                     className={styles.searchClear}
//                                     aria-label="Clear search"
//                                     onClick={() => {
//                                         setSearchId("");
//                                         setAppliedSearch("");
//                                         setSearchHint("");
//                                         setPage(1);
//                                     }}
//                                 >
//                                     ×
//                                 </button>
//                             )}
//                         </div>
//                         <button className={styles.searchBtn} onClick={submitSearch}>
//                             Search
//                         </button>
//                         <span className={styles.resultBadge} aria-live="polite">
//                             {`${totalCount} result${totalCount === 1 ? "" : "s"}`}
//                         </span>
//                     </div>
//                 </div>

//                 {searchHint && <p className={styles.searchHint}>{searchHint}</p>}

//                 <div className={styles.transactionList}>
//                     <div className={styles.transactionHeader}>
//                         <span>ID</span>
//                         <span>Description</span>
//                         <span>Donor</span>
//                         <span>Date</span>
//                         <span>Amount</span>
//                         <span>Receipt</span>
//                     </div>

//                     <div id="transaction-container">
//                         {loading && (
//                             <div className={styles.emptyState}><p>Loading…</p></div>
//                         )}

//                         {!loading && transactions.map((transaction) => (
//                             <div
//                                 id={`row-${transaction.id}`}
//                                 className={`${styles.transactionItem} ${highlightTxnId === transaction.id ? styles.highlightRow : ""}`}
//                                 key={transaction.id}
//                             >
//                                 <span className={styles.transactionId}>{transaction.id}</span>
//                                 <span className={styles.transactionDesc}>{transaction.description}</span>
//                                 <span className={styles.transactionDonor}>{transaction.donor}</span>
//                                 <span className={styles.transactionDate}>{transaction.date}</span>
//                                 <span
//                                     className={`${styles.transactionAmount} ${transaction.type === "income" ? styles.income : styles.expense}`}
//                                 >
//                                     {transaction.type === "income" ? "+" : "-"}
//                                     {formatINR(Math.abs(transaction.amount))}
//                                 </span>
//                                 <span>
//                                     <button className={styles.generateBtn} onClick={() => generateReceipt(transaction.id)}>
//                                         Generate
//                                     </button>
//                                 </span>
//                             </div>
//                         ))}

//                         {!loading && transactions.length === 0 && (
//                             <div className={styles.emptyState}>
//                                 <p>No transactions match your selection.</p>
//                             </div>
//                         )}
//                     </div>

//                     <Pagination
//                         currentPage={page}
//                         totalPages={totalPages}
//                         onPageChange={setPage}
//                         limit={limit}
//                         onLimitChange={(val) => {
//                             setLimit(val);
//                             setPage(1);
//                         }}
//                     />

//                 </div>
//             </div>

//             {/* Modal (Admin-only) */}
//             <div
//                 className={`${styles.modalOverlay} ${modalOpen ? styles.active : ""}`}
//                 role="dialog"
//                 aria-hidden={!modalOpen}
//             >
//                 <div className={styles.modalContent}>
//                     <div className={styles.modalHeader}>
//                         <div>
//                             <h3>Add New Transaction</h3>
//                             <p className={styles.subtle}>Quickly record an income or expense.</p>
//                         </div>
//                         <button onClick={closeAddModal} className={styles.closeBtn} aria-label="Close">
//                             ×
//                         </button>
//                     </div>

//                     {user?.role === "admin" ? (
//                         <div className={styles.transactionForm}>
//                             <div className={styles.formGroup}>
//                                 <label>Type</label>
//                                 <select name="type" value={form.type} onChange={handleFormChange} className={styles.formInput}>
//                                     <option value="income">Income</option>
//                                     <option value="expense">Expense</option>
//                                 </select>
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label>Amount</label>
//                                 <input name="amount" className={styles.formInput} value={form.amount} onChange={handleFormChange} type="number" step="0.01" placeholder="Enter amount" />
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label>Description</label>
//                                 <input name="description" className={styles.formInput} value={form.description} onChange={handleFormChange} placeholder="Enter description" />
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label>Donor</label>
//                                 <input name="donor" className={styles.formInput} value={form.donor} onChange={handleFormChange} placeholder="Enter donor" />
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label>Date</label>
//                                 <input name="date" className={styles.formInput} value={form.date} onChange={handleFormChange} type="date" />
//                             </div>

//                             <div className={styles.formActions}>
//                                 <button type="button" onClick={closeAddModal} className={styles.cancelBtn}>Cancel</button>
//                                 <button type="button" onClick={addTransaction} className={styles.submitBtn}>Add Transaction</button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className={styles.emptyState}>
//                             <p>You do not have permission to add transactions.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

//     // --- Receipt (client-side PDF)
//     function generateReceipt(txnId) {
//         const txn = transactions.find((t) => t.id === txnId);
//         if (!txn) return alert("Transaction not found.");

//         const doc = new jsPDF();
//         doc.setFontSize(18);
//         doc.setTextColor(40);
//         doc.text("Payment Receipt", 105, 20, { align: "center" });

//         doc.setDrawColor(200);
//         doc.line(20, 25, 190, 25);

//         doc.setFontSize(12);
//         doc.setTextColor(50);

//         let y = 40;
//         const lineHeight = 10;

//         doc.text(`Transaction ID:`, 30, y);
//         doc.text(`${txn.id}`, 92, y);

//         y += lineHeight;
//         doc.text(`Type:`, 30, y);
//         doc.text(`${txn.type.toUpperCase()}`, 92, y);

//         y += lineHeight;
//         doc.text(`Donor:`, 30, y);
//         doc.text(`${txn.donor || "-"}`, 92, y);

//         y += lineHeight;
//         doc.text(`Amount:`, 30, y);
//         doc.text(`${formatINR(txn.amount)}`, 92, y);

//         y += lineHeight;
//         doc.text(`Description:`, 30, y);
//         doc.text(`${txn.description}`, 92, y);

//         y += lineHeight;
//         doc.text(`Date:`, 30, y);
//         doc.text(`${txn.date}`, 92, y);

//         doc.setDrawColor(100);
//         doc.rect(25, 30, 160, y - 20);

//         doc.setFontSize(10);
//         doc.setTextColor(150);
//         doc.text("Jazakallahu Khair", 105, y + 25, { align: "center" });

//         doc.save(`receipt-${txn.id}.pdf`);
//     }
// }

// export default Finance;

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./Finance.module.css";
import {
    getTransactions as apiGetTransactions,
    createTransaction as apiCreateTransaction,
    getProfile as apiGetProfile,
} from "../../api/internal";
import TransactionTable from "./TransactionTable";

function Finance() {
    // --- helper to format INR with 2 decimals and sign handling
    function formatINR(value) {
        const n = Number(value) || 0;
        const abs = Math.abs(n);
        const formatted = abs.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return `${n < 0 ? "-" : ""}₹${formatted}`;
    }

    // --- user / role
    const [user, setUser] = useState(null);

    // --- data & loading
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- server-driven summary & pagination
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // --- filter state (mirrors backend API)
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const [filterOpen, setFilterOpen] = useState(false);
    const [filterScope, setFilterScope] = useState("all"); // 'all' | 'year' | 'month'
    const [typeFilter, setTypeFilter] = useState("all");   // 'all' | 'income' | 'expense'
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(null); // 0..11 or null

    // server-applied search string
    const [appliedSearch, setAppliedSearch] = useState("");

    // years list
    const years = useMemo(() => Array.from({ length: 10 }, (_, i) => currentYear - i), [currentYear]);

    useEffect(() => { if (filterScope !== "month") setSelectedMonth(null); }, [filterScope]);

    const selectionLabel = useMemo(() => {
        if (filterScope === "all") return "All time";
        if (filterScope === "year") return `${selectedYear}`;
        if (filterScope === "month") return `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`;
        return "All time";
    }, [filterScope, selectedYear, selectedMonth, monthsShort]);

    // fetch logged-in user
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await apiGetProfile();
                if (alive) setUser(res?.data?.user || null);
            } catch (_) { }
        })();
        return () => { alive = false; };
    }, []);

    // build params for backend
    const buildParams = useCallback(() => {
        const params = { page, limit };

        if (filterScope === "year") {
            params.scope = "year"; params.year = selectedYear;
        } else if (filterScope === "month") {
            params.scope = "month"; params.year = selectedYear;
            if (selectedMonth !== null && selectedMonth !== undefined) params.month = selectedMonth;
        } else {
            params.scope = "all";
        }

        if (typeFilter === "income" || typeFilter === "expense") params.type = typeFilter;

        if (appliedSearch.trim()) params.search = appliedSearch.trim();

        return params;
    }, [page, limit, filterScope, selectedYear, selectedMonth, typeFilter, appliedSearch]);

    // load transactions
    const loadTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = buildParams();
            const res = await apiGetTransactions(params);
            const data = res?.data || {};

            const list = Array.isArray(data.transactions) ? data.transactions : [];
            setTransactions(
                list.map((t) => ({
                    id: t.txnId || t._id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    donor: t.donor,
                    date: t.date,
                    timestamp: t.timestamp,
                }))
            );

            const s = data.summary || { income: 0, expense: 0, balance: 0 };
            setSummary({
                income: Number(s.income) || 0,
                expense: Number(s.expense) || 0,
                balance: Number(s.balance) || 0,
            });

            setTotalCount(Number(data.totalCount) || list.length || 0);
            setTotalPages(Number(data.totalPages) || 1);
        } catch (err) {
            setTransactions([]);
            setSummary({ income: 0, expense: 0, balance: 0 });
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    // initial + whenever filters/search/page/limit change
    useEffect(() => {
        let alive = true;
        (async () => { await loadTransactions(); })();
        return () => { alive = false; };
    }, [loadTransactions]);

    // Admin: Add Transaction modal
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        type: "income",
        amount: "",
        description: "",
        donor: "",
        date: new Date().toISOString().split("T")[0],
    });

    function handleFormChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }
    function clearForm() {
        setForm({
            type: "income",
            amount: "",
            description: "",
            donor: "",
            date: new Date().toISOString().split("T")[0],
        });
    }
    function openAddModal() { setModalOpen(true); }
    function closeAddModal() { setModalOpen(false); clearForm(); }

    async function addTransaction() {
        const amount = parseFloat(form.amount);
        if (!amount || amount <= 0) return alert("Please enter a valid amount");
        if (!form.description.trim()) return alert("Please enter a description");
        if (!form.donor || !form.donor.trim()) return alert("Please enter a donor");
        if (!form.date) return alert("Please select a date");

        try {
            await apiCreateTransaction({
                type: form.type,
                amount,
                description: form.description.trim(),
                donor: form.donor.trim(),
                date: form.date,
                timestamp: new Date(form.date).getTime(),
            });

            await loadTransactions();

            const d = new Date(form.date);
            setSelectedYear(d.getFullYear());
            setSelectedMonth(d.getMonth());
            setFilterScope("month");
            setTypeFilter("all");
        } catch (err) {
            if (err?.response?.status === 403) {
                alert("You don’t have permission to add transactions.");
            } else {
                alert("Failed to save transaction.");
            }
        }

        closeAddModal();
    }

    // filter popover outside click handling
    const filterRef = useRef(null);
    const filterBtnRef = useRef(null);
    useEffect(() => {
        function handleDocClick(e) {
            if (!filterOpen) return;
            if (filterRef.current && filterRef.current.contains(e.target)) return;
            if (filterBtnRef.current && filterBtnRef.current.contains(e.target)) return;
            setFilterOpen(false);
        }
        document.addEventListener("mousedown", handleDocClick);
        return () => document.removeEventListener("mousedown", handleDocClick);
    }, [filterOpen]);

    // called by TransactionTable
    const handleApplySearch = useCallback((q) => {
        setAppliedSearch(q.trim());
        setPage(1);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.dashboardHeader}>
                <div className={styles.headerLeft}>
                    <h1>Finance Dashboard</h1>
                    <p className={styles.subtle}>Track income &amp; expenses across years.</p>
                </div>

                {/* Admin-only: Add Transaction */}
                {user?.role === "admin" && (
                    <button className={styles.addBtn} onClick={openAddModal}>
                        +<span className={styles.btnText}>Add Transaction</span>
                    </button>
                )}
            </div>

            {/* Insights with filter popover */}
            <div className={styles.insightsCard}>
                <div className={styles.sectionHeader}>
                    <h2>Insights</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ textAlign: "right", fontSize: 13, color: "#64748b" }}>
                            <div>{selectionLabel}</div>
                            <div style={{ fontSize: 12 }}>
                                Type: {typeFilter === "all" ? "All" : typeFilter}
                            </div>
                        </div>

                        <div style={{ position: "relative" }}>
                            <button
                                ref={filterBtnRef}
                                className={styles.filterBtn}
                                onClick={() => setFilterOpen((s) => !s)}
                                aria-expanded={filterOpen}
                            >
                                Filter
                            </button>

                            {filterOpen && (
                                <div
                                    ref={filterRef}
                                    className={styles.filterPopover}
                                    role="dialog"
                                    aria-label="Filter transactions"
                                >
                                    <div className={styles.popRow}>
                                        <label className={styles.popLabel}>Type</label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className={styles.formInput}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="income">Income Only</option>
                                            <option value="expense">Expenses Only</option>
                                        </select>
                                    </div>

                                    <div className={styles.popRow}>
                                        <label className={styles.popLabel}>Scope</label>
                                        <div className={styles.scopeOptions}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="scope"
                                                    value="all"
                                                    checked={filterScope === "all"}
                                                    onChange={() => { setFilterScope("all"); setSelectedMonth(null); setPage(1); }}
                                                />{" "}
                                                All time
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="scope"
                                                    value="year"
                                                    checked={filterScope === "year"}
                                                    onChange={() => { setFilterScope("year"); setPage(1); }}
                                                />{" "}
                                                Year
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="scope"
                                                    value="month"
                                                    checked={filterScope === "month"}
                                                    onChange={() => { setFilterScope("month"); setPage(1); }}
                                                />{" "}
                                                Month
                                            </label>
                                        </div>
                                    </div>

                                    {(filterScope === "year" || filterScope === "month") && (
                                        <div className={styles.popRow}>
                                            <label className={styles.popLabel}>Year</label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => { setSelectedYear(parseInt(e.target.value, 10)); setPage(1); }}
                                                className={styles.formInput}
                                            >
                                                {years.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {filterScope === "month" && (
                                        <div className={styles.popRow}>
                                            <label className={styles.popLabel}>Month</label>
                                            <select
                                                value={selectedMonth ?? ""}
                                                onChange={(e) => {
                                                    setSelectedMonth(e.target.value === "" ? null : parseInt(e.target.value, 10));
                                                    setPage(1);
                                                }}
                                                className={styles.formInput}
                                            >
                                                <option value="">--Select month--</option>
                                                {monthsShort.map((m, i) => (
                                                    <option key={i} value={i}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className={styles.popActions}>
                                        <button className={styles.cancelBtn} onClick={() => setFilterOpen(false)}>
                                            Close
                                        </button>
                                        <button
                                            className={styles.submitBtn}
                                            onClick={() => {
                                                setFilterOpen(false);
                                                // auto refetch via effects
                                            }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary (from server) */}
                <div className={styles.insightSummary}>
                    <div className={styles.statPill}>
                        <span>
                            Income (
                            {filterScope === "all"
                                ? "All time"
                                : filterScope === "year"
                                    ? selectedYear
                                    : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
                            )
                        </span>
                        <strong>{formatINR(summary.income)}</strong>
                    </div>
                    <div className={styles.statPill}>
                        <span>
                            Expenses (
                            {filterScope === "all"
                                ? "All time"
                                : filterScope === "year"
                                    ? selectedYear
                                    : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
                            )
                        </span>
                        <strong>{formatINR(summary.expense)}</strong>
                    </div>
                    <div className={styles.statPill}>
                        <span>
                            Balance (
                            {filterScope === "all"
                                ? "All time"
                                : filterScope === "year"
                                    ? selectedYear
                                    : `${monthsShort[selectedMonth ?? 0]} ${selectedYear}`}
                            )
                        </span>
                        <strong>{formatINR(summary.balance)}</strong>
                    </div>
                </div>
            </div>

            {/* Transactions moved into its own component */}
            <TransactionTable
                transactions={transactions}
                loading={loading}
                totalCount={totalCount}
                totalPages={totalPages}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                selectionLabel={selectionLabel}
                typeFilter={typeFilter}
                appliedSearch={appliedSearch}
                onApplySearch={handleApplySearch}
            />

            {/* Modal (Admin-only) */}
            <div
                className={`${styles.modalOverlay} ${modalOpen ? styles.active : ""}`}
                role="dialog"
                aria-hidden={!modalOpen}
            >
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <div>
                            <h3>Add New Transaction</h3>
                            <p className={styles.subtle}>Quickly record an income or expense.</p>
                        </div>
                        <button onClick={closeAddModal} className={styles.closeBtn} aria-label="Close">
                            ×
                        </button>
                    </div>

                    {user?.role === "admin" ? (
                        <div className={styles.transactionForm}>
                            <div className={styles.formGroup}>
                                <label>Type</label>
                                <select name="type" value={form.type} onChange={handleFormChange} className={styles.formInput}>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Amount</label>
                                <input name="amount" className={styles.formInput} value={form.amount} onChange={handleFormChange} type="number" step="0.01" placeholder="Enter amount" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <input name="description" className={styles.formInput} value={form.description} onChange={handleFormChange} placeholder="Enter description" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Donor</label>
                                <input name="donor" className={styles.formInput} value={form.donor} onChange={handleFormChange} placeholder="Enter donor" />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Date</label>
                                <input name="date" className={styles.formInput} value={form.date} onChange={handleFormChange} type="date" />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={closeAddModal} className={styles.cancelBtn}>Cancel</button>
                                <button type="button" onClick={addTransaction} className={styles.submitBtn}>Add Transaction</button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>You do not have permission to add transactions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Finance;
