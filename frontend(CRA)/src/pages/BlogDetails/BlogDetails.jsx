import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./BlogDetails.module.css";
import {
  getBlogById,
  deleteBlog,
  postComment,
  getCommentsById,
} from "../../api/internal";
import Loader from "../../components/Loader/Loader";
import CommentList from "../../components/CommentList/CommentList";
import { toast } from "react-toastify";

function BlogDetails() {
  const [blog, setBlog] = useState([]);
  const [comments, setComments] = useState([]);
  const [ownsBlog, setOwnsBlog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reload, setReload] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.id;

  const userId = useSelector((state) => state.user._id);

  useEffect(() => {
    async function getBlogDetails() {
      const commentResponse = await getCommentsById(blogId);
      if (commentResponse.status === 200) {
        setComments(commentResponse.data.data);
      }

      const blogResponse = await getBlogById(blogId);
      if (blogResponse.status === 200) {
        setOwnsBlog(userId === blogResponse.data.blog.authorId);
        setBlog(blogResponse.data.blog);
      }
    }
    getBlogDetails();
  }, [blogId, userId, reload]);

  const postCommentHandler = async () => {
    const data = {
      author: userId,
      blog: blogId,
      content: newComment,
    };

    const response = await postComment(data);

    if (response.status === 201) {
      setNewComment("");
      setReload(!reload);
    }
  };

  const deleteBlogHandler = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    const response = await deleteBlog(blogId);
    if (response.status === 200) {
      toast.success("Blog deleted successfully!");
      navigate("/");
    } else {
      toast.error("Failed to delete blog.");
    }
  };

  const handleEditClick = () => {
    if (ownsBlog) {
      navigate(`/blog-update/${blog._id}`);
    } else {
      toast.warn("You're not allowed to edit this blog.");
    }
  };

  if (blog.length === 0) {
    return <Loader text="blog details" />;
  }

  return (
    <div className={styles.detailsWrapper}>
      <div className={styles.left}>
        <h1 className={styles.title}>{blog.title}</h1>
        <div className={styles.meta}>
          <p>
            @{blog.authorUsername +
              " on " +
              new Date(blog.createdAt).toDateString()}
          </p>
        </div>
        <div className={styles.photo}>
          <img src={blog.photo} width={250} height={250} alt={blog.title} />
        </div>
        <p className={styles.content}>{blog.content}</p>

        <button className={styles.editButton} onClick={() => navigate("/blogs")}>
          ← Back to Blogs
        </button>
        {ownsBlog && (
          <div className={styles.controls}>
            <button
              className={styles.editButton}
              onClick={handleEditClick}
            >
              Edit
            </button>
            <button className={styles.deleteButton} onClick={deleteBlogHandler}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.commentsWrapper}>
          <CommentList comments={comments} />
          <div className={styles.postComment}>
            <input
              className={styles.input}
              placeholder="comment goes here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              className={styles.postCommentButton}
              onClick={postCommentHandler}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetails;
