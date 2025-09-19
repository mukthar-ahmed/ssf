import { useState } from "react";
import { submitBlog } from "../../api/internal";
import { useSelector } from "react-redux";
import styles from "./SubmitBlog.module.css";
import TextInput from "../../components/TextInput/TextInput";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { toast } from "react-toastify";

function SubmitBlog() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(""); // for preview only
  const [photoFile, setPhotoFile] = useState(null); // actual file
  const [loading, setLoading] = useState(false);

  const author = useSelector((state) => state.user._id);

  const getPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file); // Store file to send to backend

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPhoto(reader.result); // for preview
    };
  };

  const submitHandler = async () => {
    if (!photoFile) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);

    try {
      const response = await submitBlog(formData); // uses multipart/form-data
      if (response.status === 201) {
        toast.success("Blog submitted successfully!");
        navigate("/blogs");
      }
    } catch (error) {
      toast.error("Error submitting blog.");
      console.error("Error submitting blog:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.header}>Create a blog!</div>
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
            {photo && <img src={photo} width={150} height={150} alt="Preview" />}
          </div>
          <button
            className={styles.submit}
            onClick={submitHandler}
            disabled={!title || !content || !photoFile}
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}

export default SubmitBlog;
