import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from ".";

export const loginSlice = createSlice({
  name: "login",
  initialState: { value: null },
  reducers: {
    setLogin: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setLogin } = loginSlice.actions;
export const getLogin = (state: RootState) => state.login.value;
export default loginSlice.reducer;
