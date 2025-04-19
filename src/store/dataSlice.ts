import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const fakeData = import.meta.glob("../mock-data/*", { import: "default" });
import type { Trip } from "../types";

function getBasicAuthHeader({
  user,
  password,
}: {
  user: string;
  password: string;
}) {
  const auth = user + ":" + password;
  const textEnc = new TextEncoder();
  const encodedAuth = textEnc.encode(auth);
  return "Basic " + encodedAuth.toBase64();
}

function getDataUrl({ user }: { user: string }) {
  return `https://cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js?_uncache=${Date.now()}`;
}

export const fetchDataForUser = createAsyncThunk(
  "data/fetchDataStatus",
  async (login: { user: string; password: string }): Promise<Trip[]> => {
    if (window.location.search.includes("fake")) {
      const searchParams = new URLSearchParams(window.location.search);
      const fakeDataName = searchParams.get("fake");
      let fakeFile = `../mock-data/${fakeDataName}.ts`;
      if (!(fakeFile in fakeData)) {
        console.error(`Unknown fake data ${fakeDataName}`);
        fakeFile = `../mock-data/julien.ts`;
      }
      return (await fakeData[fakeFile]()) as Trip[];
    }

    if (!login.user) {
      throw new Error("No user has been provided");
    }

    if (!login.password) {
      throw new Error("No password has been provided");
    }

    const res = await fetch(getDataUrl(login), {
      headers: { Authorization: getBasicAuthHeader(login) },
    });
    const trips = await res.text();
    const firstEqualSign = trips.indexOf("=");
    if (firstEqualSign < 0) {
      return [];
    }
    const strJson = trips.slice(firstEqualSign + 1);
    return JSON.parse(strJson);
  },
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
        state.data = action.payload;
        state.loading = "succeeded";
      });
  },
});

export default dataSlice.reducer;
