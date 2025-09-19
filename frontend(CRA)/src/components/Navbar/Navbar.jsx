import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useSelector, useDispatch } from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";
import { ThemeContext } from "../../context/ThemeContext";
import { useSpring, animated } from "react-spring";

function Navbar() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.auth);
  const [showNavbar, setShowNavbar] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDarkMode = theme === "dark";

  // Parameters for sun/moon toggle
  const properties = {
    sun: {
      r: 5,
      transform: "rotate(90deg)",
      cx: 30,
      cy: 0,
      opacity: 1
    },
    moon: {
      r: 9,
      transform: "rotate(40deg)",
      cx: 12,
      cy: 4,
      opacity: 0
    },
    springConfig: { mass: 4, tension: 250, friction: 35 }
  };

  const { r, transform, cx, cy, opacity } = properties[isDarkMode ? "moon" : "sun"];

  const svgContainerProps = useSpring({
    transform,
    config: properties.springConfig
  });

  const centerCircleProps = useSpring({
    r,
    config: properties.springConfig
  });

  const maskedCircleProps = useSpring({
    cx,
    cy,
    config: properties.springConfig
  });

  const linesProps = useSpring({
    opacity,
    config: properties.springConfig
  });

  const handleSignout = async () => {
    await signout();
    dispatch(resetUser());
  };

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const closeSidebar = () => {
    setShowNavbar(false);
  };


  const ThemeToggle = ({ position }) => {
    const maskId = `moonMask-${position}`;

    return (
      <div className={`${styles.themeToggleContainer} ${styles[position + 'ThemeToggle']}`} onClick={toggleTheme}>
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
          style={{
            cursor: "pointer",
            ...svgContainerProps
          }}
        >
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <animated.circle style={maskedCircleProps} r="9" fill="black" />
            </mask>
          </defs>

          <animated.circle
            cx="12"
            cy="12"
            style={centerCircleProps}
            fill="currentColor"
            mask={`url(#${maskId})`}
          />
          <animated.g stroke="currentColor" style={linesProps}>
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </animated.g>
        </animated.svg>
      </div>
    );
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <NavLink to="/" className={styles.logo}>
            SSF Katipalla
          </NavLink>

          <div className={styles.mobileControls}>
            {/* Mobile theme toggle in header */}
            <ThemeToggle position="mobile" />

            <div
              className={`${styles.menuIcon} ${showNavbar && styles.open}`}
              onClick={handleShowNavbar}
            >
              <div className={styles.bar}></div>
              <div className={styles.bar}></div>
              <div className={styles.bar}></div>
            </div>
          </div>

          <div className={`${styles.navElements} ${showNavbar && styles.active}`}>
            <div className={styles.centerLinks}>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? styles.activeStyle : styles.inActiveStyle
                }
                onClick={closeSidebar}
              >
                Home
              </NavLink>

              <NavLink
                to="blogs"
                className={({ isActive }) =>
                  isActive ? styles.activeStyle : styles.inActiveStyle
                }
                onClick={closeSidebar}
              >
                Blogs
              </NavLink>
              <NavLink
                to="finance"
                className={({ isActive }) =>
                  isActive ? styles.activeStyle : styles.inActiveStyle
                }
                onClick={closeSidebar}
              >
                Finance
              </NavLink>
            </div>

            <div className={styles.authButtons}>
              {/* Desktop theme toggle */}
              <ThemeToggle position="desktop" />

              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? styles.activeStyle : styles.inActiveStyle
                    }
                    onClick={closeSidebar}
                  >
                    Profile
                  </NavLink>
                  <button
                    className={styles.signOutButton}
                    onClick={() => {
                      handleSignout();
                      closeSidebar();
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="login" onClick={closeSidebar}>
                    <button className={styles.logInButton}>Log In</button>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.separator}></div>
      </nav>
    </>
  );
}

export default Navbar;