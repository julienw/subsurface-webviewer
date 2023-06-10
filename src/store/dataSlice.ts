import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fakeData from "../mock-data/julien";
import type { RootState } from ".";
import type { Trip } from "../types";

function getDataUrl(user: string) {
  return `https://cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js`;
}

export const fetchDataForUser = createAsyncThunk(
  "data/fetchDataStatus",
  (user: string) => {
    if (!user) {
      throw new Error("No user has been provided");
    }

    if (window.location.search.includes("fake")) {
      return fakeData;
    }

    const url = getDataUrl(user);
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.src = url;
      scriptElement.addEventListener(
        "load",
        () => {
          // Typescript doesn't know about window.trips.
          // @ts-ignore
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
      .addCase(fetchDataForUser.pending, (state, action) => {
        state.loading = "pending";
      })
      .addCase(fetchDataForUser.rejected, (state, action) => {
        state.loading = "failed";
        state.data = null;
      })
      .addCase(fetchDataForUser.fulfilled, (state, action) => {
        // We'll deal with that later -- or not
        // @ts-ignore
        state.data = action.payload;
        state.loading = "succeeded";
      });
  },
});

export default dataSlice.reducer;
