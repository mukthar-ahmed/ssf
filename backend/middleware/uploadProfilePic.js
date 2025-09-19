const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/index');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'profile',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => `user_${req.user._id}_${Date.now()}`
    }
});

const uploadProfilePic = multer({ storage });

module.exports = uploadProfilePic;
