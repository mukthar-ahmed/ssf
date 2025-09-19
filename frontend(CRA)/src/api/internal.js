import axios from "axios";
const baseURL = process.env.REACT_APP_API_BASE_URL;
const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🧑‍💻 AUTH APIs
export const login = async (data) => {
    try {
        return await api.post("/login", data);
    } catch (error) {
        return error;
    }
};

export const signup = async (data) => {
    try {
        return await api.post("/register", data);
    } catch (error) {
        return error;
    }
};

export const signout = async () => {
    try {
        return await api.post("/logout");
    } catch (error) {
        return error;
    }
};

// 👨‍💻 ADMIN APIs
export const getAllUsers = async () => {
    try {
        return await api.get("/admin/users");
    } catch (error) {
        return error;
    }
};

export const deleteUser = async (userId) => {
    try {
        return await api.delete(`/admin/user/${userId}`);
    } catch (error) {
        return error;
    }
};

export const promoteUser = async (email) => {
    try {
        return await api.post("/admin/promote", { email });
    } catch (error) {
        return error;
    }
};

// 🧑‍💼 USER APIs
export const getProfile = async () => {
    try {
        return await api.get("/me");
    } catch (error) {
        return error;
    }
};

export const updateProfile = async (data) => {
    try {
        return await api.put("/me", data);
    } catch (error) {
        return error;
    }
};

export const changePassword = async (data) => {
    try {
        return await api.put("/me/password", data);
    } catch (error) {
        throw error;
    }
};

export const updateProfilePic = async (formData) => {
    try {
        return await api.put("/me/profile-pic", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    } catch (error) {
        return error;
    }
};




// 📝 BLOG APIs
export const getAllBlogs = async () => {
    try {
        return await api.get("/blog/all");
    } catch (error) {
        return error;
    }
};

export const submitBlog = async (formData) => {
    try {
        return await api.post("/blog", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    } catch (error) {
        return error;
    }
};


export const getBlogById = async (id) => {
    try {
        return await api.get(`/blog/${id}`);
    } catch (error) {
        return error;
    }
};

export const updateBlog = async (formData) => {
    try {
        return await api.put("/blog", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    } catch (error) {
        return error;
    }
};

export const deleteBlog = async (id) => {
    try {
        return await api.delete(`/blog/${id}`);
    } catch (error) {
        return error;
    }
};

// 💬 COMMENT APIs
export const getCommentsById = async (id) => {
    try {
        return await api.get(`/comment/${id}`, {
            validateStatus: false,
        });
    } catch (error) {
        return error;
    }
};

export const postComment = async (data) => {
    try {
        return await api.post("/comment", data);
    } catch (error) {
        return error;
    }
};

// transactions
export const getTransactions = async (params = {}) => {
    try {
        return await api.get("/transactions", { params });
    } catch (err) {
        throw err;
    }
};

export const createTransaction = async (data) => {
    try {
        return await api.post("/transactions", data);
    } catch (err) {
        throw err;
    }
};

export const getTransactionById = async (id) => {
    try {
        return await api.get(`/transactions/${id}`);
    } catch (err) {
        throw err;
    }
};

export const deleteTransaction = async (id) => {
    try {
        return await api.delete(`/transactions/${id}`);
    } catch (err) {
        throw err;
    }
};

export const updateTransaction = async (id, data) => {
    try {
        return await api.put(`/transactions/${id}`, data);
    } catch (err) {
        throw err;
    }
};

// 🔐 INTERCEPTOR: Handle token refresh automatically
api.interceptors.response.use(
    (config) => config,
    async (error) => {
        const originalReq = error.config;

        const errorMessage = error?.response?.data?.message;

        if (
            errorMessage === "unauthorised" &&
            (error.response.status === 401 || error.response.status === 500) &&
            originalReq &&
            !originalReq._isRetry
        ) {
            originalReq._isRetry = true;

            try {
                await axios.get(`${baseURL}/refresh`, {
                    withCredentials: true,
                });

                return api.request(originalReq);
            } catch (err) {
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);
