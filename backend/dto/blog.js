class BlogDTO {
    constructor(blog) {
        this._id = blog._id;
        this.title = blog.title;
        this.content = blog.content;
        this.photopath = blog.photopath;
        this.createdAt = blog.createdAt;
        this.author = {
            username: blog.author.username,
            profilePic: blog.author.profilePic
        };
    }
}

module.exports = BlogDTO;