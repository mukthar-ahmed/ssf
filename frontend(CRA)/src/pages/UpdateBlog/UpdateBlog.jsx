import { useState, useEffect } from "react";
import { getBlogById, updateBlog } from "../../api/internal";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UpdateBlog.module.css";
import { useSelector } from "react-redux";
import TextInput from "../../components/TextInput/TextInput";
import Loader from "../../components/Loader/Loader"; 

function UpdateBlog() {
  const navigate = useNavigate();

  const params = useParams();
  const blogId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(""); // Current photo URL or base64
  const [newPhoto, setNewPhoto] = useState(null); // New photo file (if any)
  const [loading, setLoading] = useState(false); // Loading state for update

  const getPhoto = (e) => {
    const file = e.target.files[0];
    setNewPhoto(file); // Store new file for upload

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPhoto(reader.result); // Show preview of new image
    };
  };

  const author = useSelector((state) => state.user._id);

  const updateHandler = async () => {
    setLoading(true); // Set loading to true when update starts
    const data = {
      author,
      title,
      content,
      blogId,
    };

    if (newPhoto) {
      // If a new photo was selected, append it to the data
      data.photo = newPhoto;
    } else {
      // If no new photo, we only send the current photo URL
      data.photo = photo;
    }

    const response = await updateBlog(data);

    setLoading(false); // Set loading to false after update request

    if (response.status === 200) {
      navigate("/");
    }
  };

  useEffect(() => {
    async function getBlogDetails() {
      setLoading(true); // Set loading to true while fetching blog details
      const response = await getBlogById(blogId);
      setLoading(false); // Set loading to false after fetching is done
      if (response.status === 200) {
        setTitle(response.data.blog.title);
        setContent(response.data.blog.content);
        setPhoto(response.data.blog.photo); // Set current photo URL
      }
    }
    getBlogDetails();
  }, [blogId]);

  if (loading) {
    return <Loader />; // Display loader when loading is true
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Edit your blog</div>
      <TextInput
        type="text"
        name="title"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "60%" }}
      />
      <textarea
        className={styles.content}
        placeholder="your content goes here..."
        maxLength={400}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className={styles.photoPrompt}>
        <p>Choose a photo</p>
        <input
          type="file"
          name="photo"
          id="photo"
          accept="image/jpg, image/jpeg, image/png"
          onChange={getPhoto}
        />
        {photo && !newPhoto && (
          <img src={photo} width={150} height={150} alt="Current Blog" />
        )}
        {newPhoto && <img src={photo} width={150} height={150} alt="New Preview" />}
      </div>
      <button className={styles.update} onClick={updateHandler}>
        Update
      </button>
    </div>
  );
}

export default UpdateBlog;
