// const Joi = require('joi');
// const Blog = require('../models/blog');
// const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
// const { BACKEND_SERVER_PATH } = require('../config/index');
// const BlogDTO = require('../dto/blog');
// const BlogDetailsDTO = require('../dto/blog-details');
// const Comment = require('../models/comment');
// const { cloudinary } = require('../config/index');


// const blogController = {

//     async create(req, res, next) {
//         const createBlogSchema = Joi.object({
//             title: Joi.string().required(),
//             author: Joi.string().regex(mongodbIdPattern).required(),
//             content: Joi.string().required(),
//             photopath: Joi.string().required()
//         });

//         const { error } = createBlogSchema.validate(req.body);
//         if (error) {
//             return next(error);
//         }

//         const { title, author, content, photopath } = req.body;

//         // Remove the base64 prefix and prepare the image buffer
//         const buffer = Buffer.from(photopath.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

//         // Upload the image to Cloudinary
//         const cloudinaryResponse = await new Promise((resolve, reject) => {

//             const uploadStream = cloudinary.uploader.upload_stream(
//                 { resource_type: 'image', folder: 'blog_images', public_id: `${Date.now()}-${author}` },
//                 (error, result) => {
//                     if (error) {
//                         reject(error);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//             uploadStream.end(buffer);
//         });

//         // Save the blog in the database with the URL of the image from Cloudinary
//         let newBlog;
//         try {
//             newBlog = new Blog({
//                 title,
//                 author,
//                 content,
//                 photopath: cloudinaryResponse.secure_url
//             });
//             await newBlog.save();
//         } catch (error) {
//             return next(error);
//         }

//         const blogDto = new BlogDTO(newBlog);
//         return res.status(201).json({ blog: blogDto });
//     },

//     async getAll(req, res, next) {
//         try {
//             const blogs = await Blog.find({})
//                 .populate('author', 'username profilePic') // 👈 Added profilePic
//                 .sort({ createdAt: -1 });

//             if (blogs.length === 0) {
//                 return res.status(200).json({ blogs: null });
//             }

//             const blogsDTO = blogs.map(blog => new BlogDTO(blog));
//             return res.status(200).json({ blogs: blogsDTO });
//         } catch (error) {
//             return next(error);
//         }
//     },


//     async getById(req, res, next) {
//         //validate id and send the response

//         const getByIdSchema = Joi.object({
//             id: Joi.string().regex(mongodbIdPattern).required()
//         });

//         const { error } = getByIdSchema.validate(req.params);

//         if (error) {
//             return next(error); // Pass error to the next middleware
//         }

//         let blog;
//         try {
//             blog = await Blog.findOne({ _id: req.params.id }).populate('author'); // Use await for the promise
//             if (!blog) {
//                 return res.status(404).json({ message: 'Blog not found' }); // Handle case if blog is not found
//             }
//         } catch (error) {
//             return next(error); // Pass error to the next middleware
//         }

//         const blogDto = new BlogDetailsDTO(blog); // Transform blog data to DTO
//         return res.status(200).json({ blog: blogDto }); // Send the response with the blog DTO
//     }
//     ,

//     async update(req, res, next) {
//         const updateBlogSchema = Joi.object({
//             title: Joi.string().required(),
//             content: Joi.string().required(),
//             author: Joi.string().regex(mongodbIdPattern).required(),
//             blogId: Joi.string().regex(mongodbIdPattern).required(),
//             photo: Joi.string() // Photo is optional
//         });

//         const { error } = updateBlogSchema.validate(req.body);
//         if (error) {
//             return next(error);
//         }

//         const { title, content, author, blogId, photo } = req.body;

//         let blog;
//         try {
//             blog = await Blog.findOne({ _id: blogId });
//         } catch (error) {
//             return next(error);
//         }

//         // If a new photo is provided, update the photo
//         if (photo) {
//             // Remove the base64 prefix and prepare the image buffer
//             const buffer = Buffer.from(photo.replace(/data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

//             // Upload the new image to Cloudinary
//             let cloudinaryResponse;
//             try {
//                 cloudinaryResponse = await cloudinary.uploader.upload_stream(
//                     { resource_type: 'image', folder: 'blog_images', public_id: `${Date.now()}-${author}` },
//                     (error, result) => {
//                         if (error) {
//                             throw error;
//                         }
//                         return result;
//                     }
//                 );
//             } catch (error) {
//                 return next(error);
//             }

//             // Delete the previous image from Cloudinary
//             const previousImagePublicId = blog.photopath.split('/').at(-1).split('.')[0];
//             try {
//                 await cloudinary.uploader.destroy(previousImagePublicId);
//             } catch (error) {
//                 return next(error);
//             }

//             // Update the blog with the new image URL
//             await Blog.updateOne(
//                 { _id: blogId },
//                 {
//                     title,
//                     content,
//                     photopath: cloudinaryResponse.secure_url // Updated Cloudinary URL
//                 }
//             );
//         } else {
//             // If no photo is provided, only update the title and content
//             try {
//                 await Blog.updateOne(
//                     { _id: blogId },
//                     { title, content }
//                 );
//             } catch (error) {
//                 return next(error);
//             }
//         }

//         return res.status(200).json({ message: 'Blog updated!' });
//     },


//     async delete(req, res, next) {
//         const deleteBlogSchema = Joi.object({
//             id: Joi.string().regex(mongodbIdPattern).required()
//         });

//         const { error } = deleteBlogSchema.validate(req.params);
//         if (error) {
//             return next(error);
//         }

//         const { id } = req.params;

//         let blog;
//         try {
//             blog = await Blog.findOne({ _id: id });
//         } catch (error) {
//             return next(error);
//         }

//         // Extract the full public ID, including the folder name
//         const imageUrlParts = blog.photopath.split('/');
//         const imageNameWithExtension = imageUrlParts.at(-1);
//         const imagePublicId = `blog_images/${imageNameWithExtension.split('.')[0]}`; // Ensure correct folder path

//         try {
//             // Delete the blog
//             await Blog.deleteOne({ _id: id });

//             // Delete the image from Cloudinary
//             await cloudinary.uploader.destroy(imagePublicId);

//             // Delete all associated comments
//             await Comment.deleteMany({ blog: id });
//         } catch (error) {
//             return next(error);
//         }

//         return res.status(200).json({ message: 'Blog deleted' });
//     }


// }

// module.exports = blogController;



const multer = require('multer');
const os = require('os');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const Blog = require('../models/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const { cloudinary } = require('../config/index');
const BlogDTO = require('../dto/blog');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const storage = multer.diskStorage({
    destination: os.tmpdir(), // Use system temp folder
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage }).single('photo');

const blogController = {
    create(req, res, next) {
        upload(req, res, async (err) => {
            if (err) return next(err);

            const createBlogSchema = Joi.object({
                title: Joi.string().required(),
                author: Joi.string().regex(mongodbIdPattern).required(),
                content: Joi.string().required()
            });

            const { title, author, content } = req.body;
            const { error } = createBlogSchema.validate({ title, author, content });
            if (error) return next(error);

            // If no file uploaded
            if (!req.file) {
                return res.status(400).json({ message: "Blog image is required" });
            }

            // Upload image to Cloudinary
            let cloudinaryResponse;
            try {
                cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'blog_images',
                    public_id: `${Date.now()}-${author}`
                });
            } catch (error) {
                return next(error);
            } finally {
                fs.unlink(req.file.path, () => { }); // Clean temp file
            }

            // Save blog
            let newBlog;
            try {
                newBlog = new Blog({
                    title,
                    author,
                    content,
                    photopath: cloudinaryResponse.secure_url
                });
                await newBlog.save();
            } catch (error) {
                return next(error);
            }

            const blogDto = new BlogDTO(newBlog);
            return res.status(201).json({ blog: blogDto });
        });
    },
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({})
                .populate('author', 'username profilePic')
                .sort({ createdAt: -1 });

            if (blogs.length === 0) {
                return res.status(200).json({ blogs: null });
            }

            const blogsDTO = blogs.map(blog => new BlogDTO(blog));
            return res.status(200).json({ blogs: blogsDTO });
        } catch (error) {
            return next(error);
        }
    },

    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = getByIdSchema.validate(req.params);
        if (error) return next(error);

        let blog;
        try {
            blog = await Blog.findOne({ _id: req.params.id }).populate('author');
            if (!blog) return res.status(404).json({ message: 'Blog not found' });
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDetailsDTO(blog);
        return res.status(200).json({ blog: blogDto });
    },

    update(req, res, next) {
        upload(req, res, async (err) => {
            if (err) return next(err);

            const updateBlogSchema = Joi.object({
                title: Joi.string().required(),
                content: Joi.string().required(),
                author: Joi.string().regex(mongodbIdPattern).required(),
                blogId: Joi.string().regex(mongodbIdPattern).required()
            });

            const { title, content, author, blogId } = req.body;
            const { error } = updateBlogSchema.validate({ title, content, author, blogId });
            if (error) return next(error);

            let blog;
            try {
                blog = await Blog.findById(blogId);
                if (!blog) {
                    return res.status(404).json({ message: 'Blog not found' });
                }
            } catch (error) {
                return next(error);
            }

            // If new image uploaded
            if (req.file) {
                let cloudinaryResponse;
                try {
                    cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'blog_images',
                        public_id: `${Date.now()}-${author}`
                    });
                } catch (error) {
                    return next(error);
                } finally {
                    fs.unlink(req.file.path, () => { });
                }

                // Delete old image
                try {
                    if (blog.photopath) {
                        const imageUrlParts = blog.photopath.split('/');
                        const imageName = imageUrlParts.at(-1).split('.')[0];
                        const publicId = `blog_images/${imageName}`;
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (error) {
                    return next(error);
                }

                // Update blog with new image
                try {
                    await Blog.updateOne({ _id: blogId }, {
                        title,
                        content,
                        photopath: cloudinaryResponse.secure_url
                    });
                } catch (error) {
                    return next(error);
                }
            } else {
                // Update only text
                try {
                    await Blog.updateOne({ _id: blogId }, { title, content });
                } catch (error) {
                    return next(error);
                }
            }

            return res.status(200).json({ message: 'Blog updated successfully' });
        });
    },



    async delete(req, res, next) {
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = deleteBlogSchema.validate(req.params);
        if (error) return next(error);

        const { id } = req.params;

        let blog;
        try {
            blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
        } catch (error) {
            return next(error);
        }

        try {
            // Safely delete image from cloudinary
            if (blog.photopath) {
                const imageUrlParts = blog.photopath.split('/');
                const imageNameWithExtension = imageUrlParts.at(-1);
                const imagePublicId = `blog_images/${imageNameWithExtension.split('.')[0]}`;
                await cloudinary.uploader.destroy(imagePublicId);
            }

            await Blog.deleteOne({ _id: id });

            // Optional: delete related comments
            if (typeof Comment !== 'undefined') {
                await Comment.deleteMany({ blog: id });
            }

        } catch (error) {
            return next(error);
        }

        return res.status(200).json({ message: 'Blog deleted' });
    }

};

module.exports = blogController;
