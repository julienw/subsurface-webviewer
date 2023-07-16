import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
  name: "login",
  initialState: {
    user: localStorage.login ?? "",
    password: localStorage.password ?? "",
  },
  reducers: {
    setUser(state, action: PayloadAction<string>) {
      state.user = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
  },
});

export const { setUser, setPassword } = loginSlice.actions;
export default loginSlice.reducer;
