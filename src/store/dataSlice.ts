import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from ".";

function getDataUrl(user: string) {
  return `https://cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js`;
}

export const fetchDataForUser = createAsyncThunk(
  "data/fetchDataStatus",
  (user: string) => {
    if (!user) {
      throw new Error("No user has been provided");
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

// [timestamp in sec, depth in mm, tank pressure in mbar, temperature in mkelvin]
type Sample = [number, number, number, number];

interface DiveEvent {
  name: string; // gaschange, surface
  value: string;
  type: string;
  time: string;
}

interface DiveComputer {
  model: string;
  deviceid: string;
  diveid: string;
}

interface Dive {
  number: number;
  subsurface_number: number;
  date: string;
  time: string;
  location: string;
  rating: number;
  visibility: number;
  current: number;
  wavesize: number;
  surge: number;
  chill: number;
  dive_duration: string;
  temperature: {
    air: string;
    water: string;
  };
  buddy: string;
  divemaster: string;
  suit: string;
  tags: string[];
  Cylinders: unknown;
  Weights: unknown;
  maxdepth: number; // mm
  duration: number; // seconds
  samples: Sample[];
  events: DiveEvent[];
  sac: string; // really a number
  otu: string; // really a number
  cns: string; // really a number
  divecomputers: DiveComputer;
  notes: string;
}

interface Trip {
  name: string;
  dives: Dive[];
}

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
