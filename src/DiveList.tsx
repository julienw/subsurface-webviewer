import { useSelector } from "react-redux";
import { type RootState } from "./store";
import { type Trip } from "./types";

function TripInfo({ trip }: { trip: Trip }) {
  return (
    <>
      {trip.dives
        .slice()
        .reverse()
        .map((dive) => (
          <div>
            {trip.name}: ({dive.number}) {dive.location}
          </div>
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
