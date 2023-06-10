import { useState } from "react";
import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { type RootState } from "./store";
import type { Trip, Dive } from "./types";
import "./DiveList.css";

function DiveGraph({ dive }: { dive: Dive }) {
  return (
    <div>
      <Line
        data={{
          datasets: [
            {
              data: dive.samples.map(([time, depth]) => ({ time, depth })),
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
      {shown ? <DiveGraph dive={dive} /> : null}
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
