import { createSlice } from "@reduxjs/toolkit";

type LoginInfo = { user: string; password: string };
export const loginSlice = createSlice({
  name: "login",
  initialState: null as null | LoginInfo,
  reducers: {
    setLogin: (state, action) => {
      if (action.payload === null) {
        return null;
      }

      return {
        user: action.payload.user,
        password: action.payload.password,
      };
    },
  },
});

export const { setLogin } = loginSlice.actions;
export default loginSlice.reducer;
