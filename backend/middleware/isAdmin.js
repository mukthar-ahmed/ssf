const isAdmin = (req, res, next) => {
    console.log("DEBUG req.user in isAdmin:", req.user);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

module.exports = isAdmin;
