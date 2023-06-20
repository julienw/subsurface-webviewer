import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fakeData from "../mock-data/julien";
import type { Trip } from "../types";

function getDataUrl({ user, password }: { user: string; password: string }) {
  const auth = encodeURIComponent(user) + ":" + encodeURIComponent(password);
  return `https://${auth}@cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js`;
}

export const fetchDataForUser = createAsyncThunk(
  "data/fetchDataStatus",
  (login: { user: string; password: string }) => {
    if (!login.user) {
      throw new Error("No user has been provided");
    }

    if (window.location.search.includes("fake")) {
      return fakeData;
    }

    const url = getDataUrl(login);
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.src = url;
      scriptElement.addEventListener(
        "load",
        () => {
          // @ts-expect-error Typescript doesn't know about window.trips.
          resolve(window.trips as Trip[]);
          scriptElement.remove();
        },
        { once: true }
      );
      scriptElement.addEventListener("error", (e) => reject(e.error));
      document.head.append(scriptElement);
    });
  }
);

interface DataState {
  data: Trip[] | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
}

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    data: null,
    loading: "idle",
  } as DataState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataForUser.pending, (state, _action) => {
        state.loading = "pending";
      })
      .addCase(fetchDataForUser.rejected, (state, _action) => {
        state.loading = "failed";
        state.data = null;
      })
      .addCase(fetchDataForUser.fulfilled, (state, action) => {
        // @ts-expect-error We'll deal with that later -- or not
        state.data = action.payload;
        state.loading = "succeeded";
      });
  },
});

export default dataSlice.reducer;
