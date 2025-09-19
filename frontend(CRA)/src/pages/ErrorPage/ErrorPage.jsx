import { useNavigate } from "react-router-dom";
import styles from "./ErrorPage.module.css";

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.errorPageWrapper}>
      <div className={styles.errorPageContainer}>
        <h1 className={styles.errorHeader}>Oops! Something went wrong.</h1>
        <p className={styles.errorMessage}>
          There was an issue with the server. Please try again later.
        </p>
        <button className={styles.homeButton} onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;