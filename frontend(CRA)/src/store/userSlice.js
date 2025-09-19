import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  email: "",
  username: "",
  auth: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, email, username, auth } = action.payload;

      state._id = _id;
      state.email = email;
      state.username = username;
      state.auth = auth;
    },
    resetUser: (state) => {
      state._id = "";
      state.email = "";
      state.username = "";
      state.auth = false;
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;


// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   _id: "",
//   email: "",
//   username: "",
//   profilePic: "", // add profile picture path if needed
//   auth: false,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       const { _id, email, username, profilePic, auth } = action.payload;

//       state._id = _id;
//       state.email = email;
//       state.username = username;
//       state.profilePic = profilePic || "";
//       state.auth = auth;
//     },

//     resetUser: (state) => {
//       state._id = "";
//       state.email = "";
//       state.username = "";
//       state.profilePic = "";
//       state.auth = false;
//     },
//   },
// });

// export const { setUser, resetUser } = userSlice.actions;
// export default userSlice.reducer;
