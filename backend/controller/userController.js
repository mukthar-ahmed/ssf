const User = require('../models/user');
const UserDTO = require('../dto/user');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../config/index')

const userController = {
    // Get Profile  
    async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ user: new UserDTO(user) });
        } catch (err) {
            next(err);
        }
    },


    async updateProfile(req, res, next) {
        const schema = Joi.object({
            name: Joi.string().max(30),
            username: Joi.string().max(30),
            email: Joi.string().email(),
            phone: Joi.string().optional(),
        });


        const { error } = schema.validate(req.body);
        if (error) return next(error);

        try {
            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $set: req.body },
                { new: true }
            );
            res.status(200).json({ message: 'Profile updated', user: new UserDTO(user) });
        } catch (err) {
            next(err);
        }
    },

    // Change password
    // async changePassword(req, res, next) {
    //     const schema = Joi.object({
    //         currentPassword: Joi.string().required(),
    //         newPassword: Joi.string().min(8).required(),
    //     });

    //     const { error } = schema.validate(req.body);
    //     if (error) return next(error);

    //     try {
    //         const user = await User.findById(req.user._id);
    //         const match = await bcrypt.compare(req.body.currentPassword, user.password);

    //         if (!match) {
    //             return res.status(400).json({ message: 'Current password is incorrect' });
    //         }

    //         const hashed = await bcrypt.hash(req.body.newPassword, 10);
    //         user.password = hashed;
    //         await user.save();

    //         res.status(200).json({ message: 'Password changed successfully' });
    //     } catch (err) {
    //         next(err);
    //     }
    // },
    async changePassword(req, res, next) {
        const schema = Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(8).required(),
        });

        const { error } = schema.validate(req.body);
        if (error) return next(error);

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const match = await bcrypt.compare(req.body.currentPassword, user.password);

            if (!match) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            const hashed = await bcrypt.hash(req.body.newPassword, 10);
            user.password = hashed;
            await user.save();

            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (err) {
            next(err);
        }
    },




    async updateProfilePic(req, res, next) {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }


            if (user.profilePic) {
                const publicId = user.profilePic;
                const result = await cloudinary.uploader.destroy(publicId);

            }
            console.log(req.file);
            const uploadedId = req.file.filename || req.file.public_id.split('/').pop();
            user.profilePic = uploadedId;
            await user.save();

            res.status(200).json({ message: 'Profile picture updated', profilePic: user.profilePic });
        } catch (err) {
            next(err);
        }
    },
    // ✅ Admin: Get all users
    async getAllUsers(req, res, next) {
        try {
            const users = await User.find({});
            const userDtos = users.map((user) => new UserDTO(user));
            return res.status(200).json({ users: userDtos });
        } catch (err) {
            next(err);
        }
    },

    // ✅ Admin: Delete user by ID
    async deleteUserById(req, res, next) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            next(err);
        }
    }

};

module.exports = userController;
