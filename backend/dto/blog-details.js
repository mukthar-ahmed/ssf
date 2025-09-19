class BlogDetailsDTO {
    constructor(blog) {
        this._id = blog._id;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photopath;
        this.createdAt = blog.createdAt;
        this.authorName = blog.author.name;
        this.authorUsername = blog.author.username;
        this.authorId = blog.author._id.toString();
    }
}
module.exports = BlogDetailsDTO;