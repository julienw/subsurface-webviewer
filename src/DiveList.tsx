import { useState } from "react";
import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import { type RootState } from "./store";
import type { Trip, Dive } from "./types";
import "./DiveList.css";

function Dive({ trip, dive }: { trip: Trip; dive: Dive }) {
  const [shown, toggleShow] = useState(false);

  return (
    <label className="dive-line">
      {trip.name}: ({dive.number}) {dive.location}
      <button type="button" onClick={() => toggleShow(!shown)}>
        <Localized id={shown ? "hide-dive" : "show-dive"} />
      </button>
    </label>
  );
}

function TripInfo({ trip }: { trip: Trip }) {
  return (
    <>
      {trip.dives
        .slice()
        .reverse()
        .map((dive) => (
          <Dive trip={trip} dive={dive} />
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
        .map((trip) => (
          <TripInfo trip={trip} />
        ))}
    </>
  );
}
