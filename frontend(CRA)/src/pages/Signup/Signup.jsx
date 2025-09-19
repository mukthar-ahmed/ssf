import { useState } from "react";
import styles from "./Signup.module.css";
import TextInput from "../../components/TextInput/TextInput";
import signupSchema from "../../schemas/signupSchema";
import { useFormik } from "formik";
import { setUser } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup } from "../../api/internal";
import logo from "../../assets/images/logo.png";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const { values, touched, handleBlur, handleChange, errors } = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
  });

  const handleSignup = async () => {
    const data = { ...values };
    const response = await signup(data);

    if (response.status === 201) {
      const user = {
        _id: response.data.user._id,
        email: response.data.user.email,
        username: response.data.user.username,
        auth: response.data.auth,
      };
      dispatch(setUser(user));
      navigate("/");
    } else if (response.code === "ERR_BAD_REQUEST") {
      setError(response.response.data.message);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupHeader}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <span>Sign Up</span>
      </div>
      <TextInput
        type="text"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Name"
        error={errors.name && touched.name ? 1 : undefined}
        errormessage={errors.name}
      />
      <TextInput
        type="text"
        name="username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Username"
        error={errors.username && touched.username ? 1 : undefined}
        errormessage={errors.username}
      />
      <TextInput
        type="text"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Email"
        error={errors.email && touched.email ? 1 : undefined}
        errormessage={errors.email}
      />
      <TextInput
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Password"
        error={errors.password && touched.password ? 1 : undefined}
        errormessage={errors.password}
      />
      <TextInput
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Confirm Password"
        error={errors.confirmPassword && touched.confirmPassword ? 1 : undefined}
        errormessage={errors.confirmPassword}
      />
      <button
        className={styles.signupButton}
        onClick={handleSignup}
        disabled={
          !values.username ||
          !values.password ||
          !values.name ||
          !values.confirmPassword ||
          !values.email ||
          errors.username ||
          errors.password ||
          errors.confirmPassword ||
          errors.name ||
          errors.email
        }
      >
        Sign Up
      </button>
      <p>
        Already have an account?{" "}
        <button className={styles.login} onClick={() => navigate("/login")}>
          Log In
        </button>
      </p>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default Signup;
