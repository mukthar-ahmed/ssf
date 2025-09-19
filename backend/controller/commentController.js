const Joi = require('joi');
const Comment = require('../models/comment');
const CommentDTO = require('../dto/comment');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {
    async create(req, res, next) {
        // Define the schema for validation
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blog: Joi.string().regex(mongodbIdPattern).required()
        });

        // Validate the request body
        const { error } = createCommentSchema.validate(req.body);

        // Handle validation error
        if (error) {
            return next(error);
        }

        const { content, author, blog } = req.body;

        try {
            const newComment = new Comment({
                content,
                author,
                blog
            });
            await newComment.save();
        } catch (error) {
            return next(error);
        }
        res.status(201).json({ message: 'Comment created successfully!' });

    },
    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = getByIdSchema.validate(req.params);
        let comments;
        const { id } = req.params
        try {
            comments = await Comment.find({ blog: id }).populate('author');
        } catch (error) {
            return next(error);

        }
        let commentsDto = [];
        for (let i = 0; i < comments.length; i++) {
            const obj = new CommentDTO(comments[i]);
            commentsDto.push(obj);
        }
        return res.status(200).json({ data: commentsDto });
    }
}

module.exports = commentController;