import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./TextInput.module.css";

function TextInput({ type, error, errormessage, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={styles.textInputWrapper}>
      <div className={styles.inputContainer}>
        <input
          {...rest}
          type={inputType}
          className={`${styles.inputField} ${error ? styles.errorInput : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.togglePasswordButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className={styles.errorMessage}>{errormessage}</p>}
    </div>
  );
}

export default TextInput;
