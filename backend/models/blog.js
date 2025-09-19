const mongoose = require('mongoose');

const { Schema } = mongoose;//extracting schema constructor from mongoose

const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    photopath: { type: String, required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' }
},
    { timestamps: true }
);//defining the blog schema

module.exports = mongoose.model('Blog', blogSchema, 'blogs');//creates a new Mongoose model named Blog based on the blogSchema.
// The third argument 'Blogs' specifies the name of the MongoDB collection where the documents will be stored.
