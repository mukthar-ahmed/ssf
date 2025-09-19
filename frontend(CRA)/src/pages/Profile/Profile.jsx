import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import {
    getProfile,
    updateProfile,
    updateProfilePic,
    changePassword,
} from "../../api/internal";
import * as yup from "yup";

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,32}$/;

const passwordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .min(8)
        .max(32)
        .matches(passwordPattern, { message: "Use lowercase, uppercase, digit, special character" }),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

function Profile() {
    const [user, setUser] = useState({});
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [preview, setPreview] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getProfile();
                if (res.data?.user) {
                    setUser(res.data.user);
                    setUsername(res.data.user.username);
                    setEmail(res.data.user.email);
                    setPhone(res.data.user.phone || "");
                }
            } catch (err) {
                console.error("Failed to fetch user profile", err);
            }
        };
        fetchUser();
    }, []);

    const handleFileChange = (e) => {
        if (!isEditing) return;
        const file = e.target.files[0];
        setProfilePic(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!isEditing) return;
        setLoading(true);
        setMessage("");

        try {
            await updateProfile({ username, email, phone });

            if (profilePic) {
                const formData = new FormData();
                formData.append("profilePic", profilePic);
                await updateProfilePic(formData);
            }

            setMessage("Profile updated successfully ✅");

            const res = await getProfile();
            if (res.data?.user) {
                setUser(res.data.user);
                setPreview(null);
            }
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setMessage(err.message || "Error updating profile ❌");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage("");

        try {
            await passwordSchema.validate({ newPassword, confirmPassword });

            await changePassword({ currentPassword, newPassword });

            setPasswordMessage("Password updated successfully ✅");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {

            const errorMsg = err.response?.data?.message || "Error updating password ❌";
            setPasswordMessage(errorMsg);
        } finally {
            setPasswordLoading(false);
        }
    };


    return (
        <div>
            {/* Profile Card */}
            <div className={styles.profileContainer}>
                <h2>Your Profile</h2>
                <form onSubmit={handleProfileUpdate} className={styles.form}>
                    <div className={styles.imageContainer}>
                        <img
                            src={
                                preview ||
                                (user.profilePic &&
                                    `https://res.cloudinary.com/dpbeqdmdz/image/upload/${user.profilePic}`)
                            }
                            alt="Profile"
                            className={styles.profileImage}
                        />
                        {!isEditing && (
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                    />

                    <label>Phone</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                    />

                    {isEditing && (
                        <div className={styles.buttonRow}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setIsEditing(false);
                                    setPreview(null);
                                    setUsername(user.username);
                                    setEmail(user.email);
                                    setPhone(user.phone || "");
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Profile"}
                            </button>
                        </div>
                    )}

                    {message && <p className={styles.message}>{message}</p>}
                </form>
            </div>


            {/* Password Card */}
            <div className={styles.profileContainer}>
                <div className={styles.passwordHeader}>
                    <h3>Password</h3>
                    {!showPasswordForm && (
                        <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => setShowPasswordForm(true)}
                        >
                            Change
                        </button>
                    )}
                </div>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordUpdate} className={styles.form}>
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />

                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <div className={styles.buttonRow}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" disabled={passwordLoading}>
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>

                        {passwordMessage && (
                            <p className={styles.message}>{passwordMessage}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );

}

export default Profile;