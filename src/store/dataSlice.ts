import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const fakeData = import.meta.glob("../mock-data/*", { import: "default" });
import type { Trip } from "../types";

function getDataUrl({ user, password }: { user: string; password: string }) {
  const auth = encodeURIComponent(user) + ":" + encodeURIComponent(password);
  return `https://${auth}@cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js`;
}

export const fetchDataForUser = createAsyncThunk(
  "data/fetchDataStatus",
  (login: { user: string; password: string }) => {
    if (window.location.search.includes("fake")) {
      const searchParams = new URLSearchParams(window.location.search);
      const fakeDataName = searchParams.get("fake");
      let fakeFile = `../mock-data/${fakeDataName}.ts`;
      if (!(fakeFile in fakeData)) {
        console.error(`Unknown fake data ${fakeDataName}`);
        fakeFile = `../mock-data/julien.ts`;
      }
      return fakeData[fakeFile]();
    }

    if (!login.user) {
      throw new Error("No user has been provided");
    }

    if (!login.password) {
      throw new Error("No password has been provided");
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
