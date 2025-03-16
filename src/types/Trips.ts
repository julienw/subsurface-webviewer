// [timestamp in min, depth in mm, tank pressure in mbar, temperature in mkelvin]
export type Sample = [number, number, number, number];

export interface DiveEvent {
  name: string; // gaschange, surface
  value: string;
  type: string;
  time: string;
}

export interface DiveComputer {
  model: string;
  deviceid: string;
  diveid: string;
}

export interface Dive {
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

export interface Trip {
  name: string;
  dives: Dive[];
}
