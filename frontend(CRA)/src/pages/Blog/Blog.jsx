import { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader";
import { getAllBlogs } from "../../api/internal";
import styles from "./Blog.module.css";
import { useNavigate } from "react-router-dom";
import dummyImage from "../../assets/images/dummy.jpg";

function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogs();

        if (response.status === 200) {
          setBlogs(
            response.data.blogs
              ? response.data.blogs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              : []
          );
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.blogContainer}>
      <h1 className={styles.blogTitle}>Resources and insights</h1>
      <p className={styles.blogSubtitle}>
        The latest industry news, interviews, technologies, and resources.
      </p>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search blogs..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className={styles.createButton}
          onClick={() => navigate("/submit")}
        >
          + Create
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className={styles.error}>Failed to load blogs. Please try again later.</div>
      ) : blogs.length === 0 || blogs === null ? (
        <div className={styles.noBlogs}>No blogs available at the moment.</div>
      ) : (
        <div className={styles.blogsWrapper}>
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => {
              const authorPic = blog.author?.profilePic
                ? `https://res.cloudinary.com/dpbeqdmdz/image/upload/${blog.author.profilePic}?t=${Date.now()}`
                : dummyImage;

              return (
                <div
                  key={blog._id}
                  className={styles.blogCard}
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  <div className={styles.authorInfo}>
                    <img
                      src={authorPic}
                      alt={blog.author?.username}
                      className={styles.authorImage}
                    />
                    <div className={styles.authorDetails}>
                      <span className={styles.authorName}>{blog.author?.username}</span>
                      <span className={styles.publishDate}>
                        {new Date(blog.createdAt).toDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.blogImageContainer}>
                    <img
                      src={blog.photopath}
                      alt={blog.title}
                      className={styles.blogImage}
                    />
                  </div>
                  <div className={styles.blogContent}>
                    <div className={styles.blogTitle}>{blog.title}</div>
                    <div className={styles.blogDescription}>
                      {blog.content.length > 100
                        ? `${blog.content.substring(0, 100)}...`
                        : blog.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.noBlogs}>No blogs match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Blog;
