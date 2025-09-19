const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const userController = require('../controller/userController');
const uploadProfilePic = require('../middleware/uploadProfilePic');
const isAdmin = require('../middleware/isAdmin');
const { makeAdmin } = require('../controller/authController');
// (near the other controllers)
const transactionController = require('../controller/transactionController');

// then add routes (keep them protected with auth)
router.post('/transactions', auth, isAdmin, transactionController.create);
router.get('/transactions', auth, transactionController.getAll);
router.get('/transactions/:id', auth, transactionController.getById);
router.put('/transactions/:id', auth, isAdmin, transactionController.update);
router.delete('/transactions/:id', auth, isAdmin, transactionController.delete);



// 🔐 Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/refresh', authController.refresh);
router.delete('/delete', auth, authController.deleteUser);

// 🧑‍💼 User profile routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.put('/me/password', auth, userController.changePassword);
router.put('/me/profile-pic', auth, uploadProfilePic.single('profilePic'), userController.updateProfilePic);

// 📝 Blog routes
router.post('/blog', auth, blogController.create);
router.get('/blog/all', auth, blogController.getAll);
router.get('/blog/:id', auth, blogController.getById);
router.put('/blog', auth, blogController.update);
router.delete('/blog/:id', auth, blogController.delete);

// 💬 Comment routes
router.post('/comment', auth, commentController.create);
router.get('/comment/:id', auth, commentController.getById);

// ✅ Admin routes
router.get('/admin/users', auth, isAdmin, userController.getAllUsers);
router.delete('/admin/user/:id', auth, isAdmin, userController.deleteUserById);
router.post('/admin/promote', auth, isAdmin, makeAdmin);

module.exports = router;
