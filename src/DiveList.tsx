import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Localized,
  useLocalization,
  type ReactLocalization,
} from "@fluent/react";
import { FluentDateTime, FluentNumber } from "@fluent/bundle";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import { type RootState } from "./store";
import type { Trip, Dive } from "./types";
import "./DiveList.css";

function findMainLocale(l10n: ReactLocalization) {
  const [mainBundle] = l10n.bundles;
  const [mainLocale] = mainBundle.locales;
  return mainLocale;
}

function DepthGraph({ dive: { samples } }: { dive: Dive }) {
  const { l10n } = useLocalization();
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
        locale: findMainLocale(l10n),
        scales: {
          y: {
            type: "linear",
            reverse: true,
            title: {
              display: true,
              text: l10n.getString("graph-axis-depth-label"),
            },
          },
          x: {
            type: "linear",
            position: "top",
            title: {
              display: true,
              text: l10n.getString("graph-axis-time-label"),
              align: "end",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}

function SpeedGraph({ dive: { samples } }: { dive: Dive }) {
  const { l10n } = useLocalization();
  const speeds = [];
  const colors = [];
  for (let i = 1; i < samples.length; i++) {
    const interval = samples[i][0] - samples[i - 1][0];
    const diff = (samples[i][1] - samples[i - 1][1]) / 1000;
    const speed = -diff / interval;
    speeds.push({ speed, time: samples[i][0] });

    let hue;
    if (speed < 0) {
      if (speed > -20) {
        hue = 120;
      } else if (speed < -30) {
        hue = 0;
      } else {
        hue = speed * 12 + 360;
      }
    } else {
      if (speed < 12) {
        hue = 120;
      } else if (speed > 17) {
        hue = 0;
      } else {
        hue = speed * -24 + 408;
      }
    }

    const color = `hsl(${hue}deg 50% 50%)`;
    colors.push(color);
  }

  return (
    <Bar
      data={{
        datasets: [
          {
            data: speeds,
            backgroundColor: colors,
            barPercentage: 1,
            categoryPercentage: 1,
          },
        ],
      }}
      options={{
        parsing: { xAxisKey: "time", yAxisKey: "speed" },
        locale: findMainLocale(l10n),
        scales: {
          x: {
            type: "linear",
            offset: false,
            grid: { offset: false },
            title: {
              display: true,
              text: l10n.getString("graph-axis-time-label"),
              align: "end",
            },
          },
          y: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-speed-label"),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}

function TemperatureGraph({ dive: { samples } }: { dive: Dive }) {
  const { l10n } = useLocalization();
  const data = samples
    .filter(([_time, _depth, _pressure, temperaturemK]) => temperaturemK)
    .map(([time, _depth, _pressure, temperaturemK]) => ({
      time,
      temperature: (temperaturemK - 273150) / 1000,
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
        locale: findMainLocale(l10n),
        scales: {
          y: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-temperature-label"),
            },
          },
          x: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-time-label"),
              align: "end",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}

function TankGraph({ dive: { samples } }: { dive: Dive }) {
  const { l10n } = useLocalization();
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
        locale: findMainLocale(l10n),
        scales: {
          y: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-tank-pressure-label"),
            },
          },
          x: {
            type: "linear",

            title: {
              display: true,
              text: l10n.getString("graph-axis-time-label"),
              align: "end",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
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
    </div>
  );
}

function Dive({ trip, dive }: { trip: Trip; dive: Dive }) {
  const [shown, toggleShow] = useState(false);

  const dateTime = Date.parse(`${dive.date}T${dive.time}`);
  const endTime = dateTime + dive.duration * 1000;
  dive = {
    ...dive,
    samples: dive.samples.map(([time, ...rest]) => [time / 60, ...rest]),
  };

  return (
    <div className="dive-line">
      <label className="dive-summary" onClick={() => toggleShow(!shown)}>
        {trip.name}: ({dive.number}) {dive.location}
        <button type="button">
          <Localized id={shown ? "hide-dive" : "show-dive"} />
        </button>
      </label>
      <div className="dive-details" onClick={() => toggleShow(!shown)}>
        <div>
          <Localized
            id="dive-date"
            vars={{
              date: new FluentDateTime(dateTime, {
                month: "long",
                year: "numeric",
                day: "numeric",
              }),
            }}
          />
        </div>
        <div>
          <Localized
            id="dive-time"
            vars={{
              startTime: new FluentDateTime(dateTime, {
                hour: "numeric",
                minute: "numeric",
              }),
              endTime: new FluentDateTime(endTime, {
                hour: "numeric",
                minute: "numeric",
              }),
              duration: dive.dive_duration,
            }}
          />
        </div>
        <div>
          <Localized
            id="dive-max-depth"
            vars={{
              depth: new FluentNumber(dive.maxdepth / 1000, {
                style: "unit",
                unit: "meter",
                maximumFractionDigits: 1,
              }),
            }}
          />
        </div>
      </div>
      {shown ? <DiveGraphs dive={dive} /> : null}
    </div>
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
