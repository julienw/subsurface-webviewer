import { useState } from "react";
import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import { type RootState } from "./store";
import type { Trip, Dive } from "./types";
import "./DiveList.css";

function DepthGraph({ dive: { samples } }: { dive: Dive }) {
  return (
    <Line
      data={{
        datasets: [
          {
            data: samples.map(([time, depth]) => ({
              time,
              depth: depth / 1000,
            })),
          },
        ],
      }}
      options={{
        parsing: {
          xAxisKey: "time",
          yAxisKey: "depth",
        },
        scales: {
          y: {
            type: "linear",
            reverse: true,
          },
          x: { type: "linear" },
        },
      }}
    />
  );
}

function SpeedGraph({ dive: { samples } }: { dive: Dive }) {
  const speeds = [];
  for (let i = 1; i < samples.length; i++) {
    const interval = (samples[i][0] - samples[i - 1][0]) / 60;
    const diff = (samples[i][1] - samples[i - 1][1]) / 1000;
    const speed = -diff / interval;
    speeds.push({ speed, time: samples[i][0] });
  }

  return (
    <Bar
      data={{
        datasets: [
          {
            data: speeds,
            barPercentage: 1,
            categoryPercentage: 1,
          },
        ],
      }}
      options={{
        parsing: { xAxisKey: "time", yAxisKey: "speed" },
        scales: {
          x: { type: "linear" },
          y: { type: "linear" },
        },
      }}
    />
  );
}

function TemperatureGraph({ dive: { samples } }: { dive: Dive }) {
  const data = samples
    .filter(([_time, _depth, _pressure, temperaturemK]) => temperaturemK)
    .map(([time, _depth, _pressure, temperaturemK]) => ({
      time,
      temperature: temperaturemK / 1000 - 173.15,
    }));

  if (!data.length) {
    return null;
  }

  return (
    <Line
      data={{
        datasets: [
          {
            data,
          },
        ],
      }}
      options={{
        parsing: {
          xAxisKey: "time",
          yAxisKey: "temperature",
        },
        scales: {
          y: {
            type: "linear",
          },
          x: { type: "linear" },
        },
      }}
    />
  );
}

function TankGraph({ dive: { samples } }: { dive: Dive }) {
  const data = samples
    .filter(([_time, _depth, pressure]) => pressure)
    .map(([time, _depth, pressure]) => ({
      time,
      pressure: pressure / 1000,
    }));

  if (!data.length) {
    return null;
  }

  return (
    <Line
      data={{
        datasets: [
          {
            data,
          },
        ],
      }}
      options={{
        parsing: {
          xAxisKey: "time",
          yAxisKey: "pressure",
        },
        scales: {
          y: {
            type: "linear",
          },
          x: { type: "linear" },
        },
      }}
    />
  );
}

function AirConsommationGraph({ dive: { samples } }: { dive: Dive }) {
  const input = samples
    .filter(([_time, _depth, pressure]) => pressure)
    .map(([time, _depth, pressure]) => ({
      time,
      pressure: pressure / 1000,
    }));

  if (!input.length) {
    return null;
  }

  const consommation = [];

  return (
    <Bar
      data={{
        datasets: [
          {
            data: consommation,
            barPercentage: 1,
            categoryPercentage: 1,
          },
        ],
      }}
      options={{
        parsing: { xAxisKey: "time", yAxisKey: "" },
        scales: {
          x: { type: "linear" },
          y: { type: "linear" },
        },
      }}
    />
  );
}

function DiveGraphs({ dive }: { dive: Dive }) {
  return (
    <div>
      <DepthGraph dive={dive} />
      <SpeedGraph dive={dive} />
      <TemperatureGraph dive={dive} />
      <TankGraph dive={dive} />
      <AirConsommationGraph dive={dive} />
    </div>
  );
}

function Dive({ trip, dive }: { trip: Trip; dive: Dive }) {
  const [shown, toggleShow] = useState(false);

  return (
    <>
      <label className="dive-line">
        {trip.name}: ({dive.number}) {dive.location}
        <button type="button" onClick={() => toggleShow(!shown)}>
          <Localized id={shown ? "hide-dive" : "show-dive"} />
        </button>
      </label>
      {shown ? <DiveGraphs dive={dive} /> : null}
    </>
  );
}

function TripInfo({ trip }: { trip: Trip }) {
  return (
    <>
      {trip.dives
        .slice()
        .reverse()
        .map((dive) => (
          <Dive key={dive.number} trip={trip} dive={dive} />
        ))}
    </>
  );
}

export function DiveList() {
  const dataInformation = useSelector((state: RootState) => state.data);

  return (
    <>
      {dataInformation.data
        ?.slice()
        .reverse()
        .map((trip, index) => (
          <TripInfo trip={trip} key={index} />
        ))}
    </>
  );
}
