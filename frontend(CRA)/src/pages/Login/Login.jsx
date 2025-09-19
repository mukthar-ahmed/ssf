import { useState } from "react";
import styles from "./Login.module.css";
import { login } from "../../api/internal";
import { setUser } from "../../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [invalidCredentialsError, setInvalidCredentialsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const data = {
      username,
      password,
    };

    setIsLoading(true);
    setInvalidCredentialsError(false); // Reset error state

    try {
      const response = await login(data);

      if (response.status === 200) {
        const user = {
          _id: response.data.user._id,
          email: response.data.user.email,
          username: response.data.user.username,
          auth: response.data.auth,
        };

        dispatch(setUser(user));
        navigate("/");
      } else {
        if (response && response.status === 401) {
          // Invalid credentials
          setInvalidCredentialsError(true);
        } else {
          // Server error
          navigate("/error");
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setInvalidCredentialsError(true);
      } else {
        navigate("/error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === "username") {
      setUsername(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
    // Clear error when user starts typing
    setInvalidCredentialsError(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <img src={logo} alt="Logo" className={styles.loginLogo} />
          <span className={styles.loginText}>Log In</span>
        </div>
        <input
          type="text"
          name="username"
          value={username}
          onChange={handleInputChange}
          placeholder="Username"
          className={styles.inputField}
        />
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleInputChange}
            placeholder="Password"
            className={styles.inputField}
          />
          <span>
            <button
              type="button"
              className={styles.togglePasswordButton}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </span>

        </div>
        {invalidCredentialsError && (
          <p className={styles.invalidCredentialsError} aria-live="polite">
            Invalid Credentials!
          </p>
        )}
        <button
          className={styles.logInButton}
          onClick={handleLogin}
          disabled={!username || !password || isLoading}
        >
          {isLoading ? "Logging In..." : "Log In"}
        </button>
        <span>
          Don't have an account?{" "}
          <button
            className={styles.createAccount}
            onClick={() => navigate("/signup")}
          >
            Register
          </button>
        </span>
      </div>
    </div>
  );
}

export default Login;