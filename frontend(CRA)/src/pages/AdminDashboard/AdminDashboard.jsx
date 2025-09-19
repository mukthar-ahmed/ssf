import React, { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";

// Import admin API functions
import { getAllUsers, deleteUser, promoteUser } from "../../api/internal.js";

function AdminDashboard() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            if (res?.data?.users) setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(userId);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePromote = async (email) => {
        try {
            await promoteUser(email);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td className={styles.capitalize}>{user.role}</td>
                                    <td>
                                        {user.role !== "admin" && (
                                            <button
                                                onClick={() => handlePromote(user.email)}
                                                className={styles.promoteBtn}
                                            >
                                                Promote
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
