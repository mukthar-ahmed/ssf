const mongoose = require('mongoose');

const { Schema } = mongoose //extracting schema constructor from mongoose

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    profilePic: { type: String },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true }
);

module.exports = mongoose.model('User', userSchema, 'users');//creates a new Mongoose model named User based on the userSchema.
