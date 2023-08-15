/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from "react";
import {
  Localized,
  useLocalization,
  type ReactLocalization,
} from "@fluent/react";
import { FluentDateTime, FluentNumber } from "@fluent/bundle";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import classnames from "classnames";
import { useAppSelector } from "./store/hooks";

import type { Trip, Dive, Sample } from "./types";
import type { ScriptableContext, TooltipItem } from "chart.js";
import "./DiveList.css";

function findMainLocale(l10n: ReactLocalization) {
  const [mainBundle] = l10n.bundles;
  const [mainLocale] = mainBundle.locales;
  return mainLocale;
}

type SpeedAndDepth = { speed: number; time: number; depth: number };
function computeSpeedAndDepth(samples: Sample[]): SpeedAndDepth[] {
  const data = [
    {
      speed: 0,
      time: samples[0][0],
      depth: samples[0][1] / 1000,
    },
  ];

  for (let i = 1; i < samples.length; i++) {
    const interval = samples[i][0] - samples[i - 1][0];
    const diff = (samples[i][1] - samples[i - 1][1]) / 1000;
    const speed = -diff / interval;
    data.push({
      speed,
      time: samples[i][0],
      depth: samples[i][1] / 1000,
    });
  }

  return data;
}

const getTooltipTitleCallback =
  (l10n: ReactLocalization) => (items: TooltipItem<"bar" | "line">[]) => {
    const time = items[0].parsed.x;
    const minutes = Math.floor(time);
    const seconds = Math.floor((time - minutes) * 60);
    return l10n.getString("graph-tooltip-title", {
      minutes: new FluentNumber(minutes, { minimumIntegerDigits: 2 }),
      seconds: new FluentNumber(seconds, { minimumIntegerDigits: 2 }),
    });
  };

const getDepthAndSpeedTooltipLabelCallback =
  (l10n: ReactLocalization) => (item: TooltipItem<"bar" | "line">) => {
    const { speed, depth } = item.raw as SpeedAndDepth;

    return [
      l10n.getString("graph-tooltip-depth-label", {
        depth: new FluentNumber(depth, {
          style: "unit",
          unit: "meter",
          maximumFractionDigits: 1,
        }),
      }),
      l10n.getString("graph-tooltip-speed-label", {
        speed: new FluentNumber(speed, {
          style: "unit",
          unit: "meter-per-minute",
          maximumFractionDigits: 1,
        }),
      }),
    ];
  };

function DepthGraph({ speedAndDepth }: { speedAndDepth: SpeedAndDepth[] }) {
  const { l10n } = useLocalization();
  const locale = findMainLocale(l10n);
  return (
    <Line
      data={{
        datasets: [
          {
            data: speedAndDepth,
          },
        ],
      }}
      options={{
        parsing: {
          xAxisKey: "time",
          yAxisKey: "depth",
        },
        locale,
        elements: { point: { pointStyle: false } },
        scales: {
          y: {
            type: "linear",
            reverse: true,
            title: {
              display: true,
              text: l10n.getString("graph-axis-depth-label"),
            },
            afterFit(scale) {
              // align all graphs
              scale.width = 60;
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
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: getTooltipTitleCallback(l10n),
              label: getDepthAndSpeedTooltipLabelCallback(l10n),
            },
          },
        },
      }}
    />
  );
}

const COLORS = {
  ok: "#348037",
  warning: "#C89F38",
  error: "#7D372D",
};

function getSpeedColor(context: ScriptableContext<"bar">) {
  const { speed, depth } = context.raw as {
    speed: number;
    time: number;
    depth: number;
  };

  let color;
  if (speed < 0) {
    if (speed > -20) {
      color = COLORS.ok;
    } else if (speed < -30) {
      color = COLORS.error;
    } else {
      color = COLORS.warning;
    }
  } else {
    if (depth < 6 && speed > 6) {
      // > 6m, the speed should be slower
      color = COLORS.error;
    } else if (speed < 12) {
      color = COLORS.ok;
    } else if (speed > 17) {
      color = COLORS.error;
    } else {
      color = COLORS.warning;
    }
  }

  return color;
}

function SpeedGraph({ speedAndDepth }: { speedAndDepth: SpeedAndDepth[] }) {
  const { l10n } = useLocalization();

  return (
    <Bar
      data={{
        datasets: [
          {
            data: speedAndDepth,
            backgroundColor: getSpeedColor,
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
            border: { color: "red" },
            title: {
              display: true,
              text: l10n.getString("graph-axis-speed-label"),
            },
            afterFit(scale) {
              // align all graphs
              scale.width = 60;
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: getTooltipTitleCallback(l10n),
              label: getDepthAndSpeedTooltipLabelCallback(l10n),
            },
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
        elements: { point: { pointStyle: false } },
        scales: {
          y: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-temperature-label"),
            },
            afterFit(scale) {
              // align all graphs
              scale.width = 60;
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
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: getTooltipTitleCallback(l10n),
              label: (ctx) => {
                const temperature = ctx.parsed.y;

                return l10n.getString("graph-tooltip-temperature-label", {
                  temperature: new FluentNumber(temperature, {
                    style: "unit",
                    unit: "celsius",
                    maximumFractionDigits: 1,
                  }),
                });
              },
            },
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
        elements: { point: { pointStyle: false } },
        scales: {
          y: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-tank-pressure-label"),
            },
            suggestedMin: 0,
            afterFit(scale) {
              // align all graphs
              scale.width = 60;
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
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: getTooltipTitleCallback(l10n),
              label: (ctx) => {
                const pressure = ctx.parsed.y;

                return l10n.getString("graph-tooltip-tank-pressure-label", {
                  pressure: new FluentNumber(pressure, {
                    maximumFractionDigits: 1,
                  }),
                });
              },
            },
          },
        },
      }}
    />
  );
}

function DiveGraphs({ dive }: { dive: Dive }) {
  const speedAndDepth = computeSpeedAndDepth(dive.samples);
  return (
    <div>
      <DepthGraph speedAndDepth={speedAndDepth} />
      <SpeedGraph speedAndDepth={speedAndDepth} />
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
      <div
        className={classnames("dive-summary", {
          "dive-summary--isShown": shown,
        })}
        onClick={() => toggleShow(!shown)}
      >
        <button type="button">
          <Localized id={shown ? "hide-dive" : "show-dive"} />
        </button>
        {trip.name}: ({dive.number}) {dive.location}
      </div>
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
  const dataInformation = useAppSelector((state) => state.data);

  return (
    <>
      {dataInformation.data
        ?.slice()
        .reverse()
        .map((trip, index) => <TripInfo trip={trip} key={index} />)}
    </>
  );
}
