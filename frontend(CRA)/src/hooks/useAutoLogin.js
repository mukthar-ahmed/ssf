// import { useState, useEffect } from "react";
// import { setUser } from "../store/userSlice";
// import { useDispatch } from "react-redux";
// import axios from "axios";

// function useAutoLogin() {
//   const [loading, setLoading] = useState(true);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     (async function autoLoginApiCall() {
//       try {
//         const response = await axios.get("http://localhost:5000/refresh", {
//           withCredentials: true,
//         });

//         if (response.status === 200) {
//           const user = {
//             _id: response.data.user._id,
//             email: response.data.user.email,
//             username: response.data.user.username,
//             auth: response.data.auth,
//           };

//           dispatch(setUser(user));
//         }
//       } catch (error) {
//         //
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [dispatch]); // ✅ Include dispatch in the dependency array


//   return loading;
// }

// export default useAutoLogin;


import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { getProfile } from "../api/internal"; // we’ll use this after /refresh
import axios from "axios";

function useAutoLogin() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async function autoLoginApiCall() {
      try {
        // Step 1: Refresh token
        const baseURL = process.env.REACT_APP_API_URL;
        const refreshRes = await axios.get(`${baseURL}/refresh`, {
          withCredentials: true,
        });

        if (refreshRes.status === 200 && refreshRes.data.auth) {
          // Step 2: Fetch user profile from secure route
          const profileRes = await getProfile();

          if (profileRes.status === 200 && profileRes.data.user) {
            const { _id, email, username } = profileRes.data.user;

            dispatch(setUser({
              _id,
              email,
              username,
              auth: true,
            }));
          }
        }
      } catch (error) {
        console.error("Auto login failed:", error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  return loading;
}

export default useAutoLogin;
