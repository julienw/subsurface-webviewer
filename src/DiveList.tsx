/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, useMemo } from "react";
import {
  Localized,
  useLocalization,
  type ReactLocalization,
} from "@fluent/react";
import { FluentDateTime, FluentNumber } from "@fluent/bundle";
import "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line, Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import classnames from "classnames";
import { useAppSelector } from "./store/hooks";
import { ShareDive } from "./ShareDive";

import type { Trip, Dive, Sample } from "./types";
import type { ScriptableContext, TooltipItem } from "chart.js";
import "./DiveList.css";

Chart.register(annotationPlugin);

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
    const speed = -diff / interval; // minus because I want to display negative speed when going down.
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

const lightMode = window.matchMedia("(prefers-color-scheme: light)");
const COLORS = {
  ok: "#348037",
  warning: "#C89F38",
  error: lightMode.matches ? "#7D372D" : "#fc745f",
};
const SPEED_LIMITS = {
  goingDown: {
    warning: 20,
    error: 30,
  },
  goingUp: {
    warning: 10,
    error: 15,
  },
  goingUpClose: {
    warning: 6,
    error: 10,
  },
} as const;

function getSpeedColor(context: ScriptableContext<"bar">) {
  const { speed, depth } = context.raw as {
    speed: number;
    time: number;
    depth: number;
  };

  let color = COLORS.ok;
  if (speed < 0) {
    if (speed < -SPEED_LIMITS.goingDown.error) {
      color = COLORS.error;
    } else if (speed < -SPEED_LIMITS.goingDown.warning) {
      color = COLORS.warning;
    }
  } else if (depth < 6) {
    if (speed > SPEED_LIMITS.goingUpClose.error) {
      color = COLORS.error;
    } else if (speed > SPEED_LIMITS.goingUpClose.warning) {
      color = COLORS.warning;
    }
  } else {
    if (speed > SPEED_LIMITS.goingUp.error) {
      // > 6m, the speed should be slower
      color = COLORS.error;
    } else if (speed > SPEED_LIMITS.goingUp.warning) {
      color = COLORS.warning;
    }
  }

  return color;
}

function SpeedGraph({ speedAndDepth }: { speedAndDepth: SpeedAndDepth[] }) {
  const { l10n } = useLocalization();
  const lang = document.documentElement.getAttribute("lang") ?? undefined;
  const meterMinuteFormatter = useMemo(
    () =>
      new Intl.NumberFormat(
        lang,

        {
          style: "unit",
          unit: "meter-per-minute",
          maximumFractionDigits: 1,
        },
      ),
    [lang],
  );

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
          annotation: {
            annotations: {
              line1: {
                type: "line",
                yMin: SPEED_LIMITS.goingUp.error,
                yMax: SPEED_LIMITS.goingUp.error,
                borderColor: COLORS.error,
                borderWidth: 1,
                drawTime: "beforeDatasetsDraw",
                display: speedAndDepth.some(
                  ({ speed }) => speed > SPEED_LIMITS.goingUp.error,
                ),
                label: {
                  display: true,
                  position: "end",
                  content: meterMinuteFormatter.format(
                    SPEED_LIMITS.goingUp.error,
                  ),
                },
              },
              line2: {
                type: "line",
                yMin: SPEED_LIMITS.goingUp.warning,
                yMax: SPEED_LIMITS.goingUp.warning,
                borderColor: COLORS.warning,
                borderWidth: 1,
                drawTime: "beforeDatasetsDraw",
                display: speedAndDepth.some(
                  ({ speed }) => speed > SPEED_LIMITS.goingUp.warning,
                ),
                label: {
                  display: true,
                  position: "end",
                  content: meterMinuteFormatter.format(
                    SPEED_LIMITS.goingUp.warning,
                  ),
                },
              },
              line3: {
                type: "line",
                yMin: SPEED_LIMITS.goingUpClose.warning,
                yMax: SPEED_LIMITS.goingUpClose.warning,
                borderColor: COLORS.warning,
                borderWidth: 1,
                borderDash: [5],
                drawTime: "beforeDatasetsDraw",
                display: speedAndDepth.some(
                  ({ speed, depth }) =>
                    depth < 6 && speed > SPEED_LIMITS.goingUpClose.warning,
                ),
                label: {
                  display: true,
                  position: "end",
                  content: meterMinuteFormatter.format(
                    SPEED_LIMITS.goingUpClose.warning,
                  ),
                },
              },
              line4: {
                type: "line",
                yMin: -SPEED_LIMITS.goingDown.warning,
                yMax: -SPEED_LIMITS.goingDown.warning,
                borderColor: COLORS.warning,
                borderWidth: 1,
                display: speedAndDepth.some(
                  ({ speed }) => speed < -SPEED_LIMITS.goingDown.warning,
                ),
                drawTime: "beforeDatasetsDraw",
                label: {
                  display: true,
                  position: "end",
                  content: meterMinuteFormatter.format(
                    SPEED_LIMITS.goingDown.warning,
                  ),
                },
              },
              line5: {
                type: "line",
                yMin: -SPEED_LIMITS.goingDown.error,
                yMax: -SPEED_LIMITS.goingDown.error,
                borderColor: COLORS.error,
                borderWidth: 1,
                display: speedAndDepth.some(
                  ({ speed }) => speed < -SPEED_LIMITS.goingDown.error,
                ),
                drawTime: "beforeDatasetsDraw",
                label: {
                  display: true,
                  position: "end",
                  content: meterMinuteFormatter.format(
                    SPEED_LIMITS.goingDown.error,
                  ),
                },
              },
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

type PressureAndConsumption = {
  pressure: number;
  time: number;
  consumption: number | null;
};
function computePressureAndConsumption(
  samples: Sample[],
): PressureAndConsumption[] {
  const data: PressureAndConsumption[] = [
    {
      consumption: null,
      time: samples[0][0],
      pressure: samples[0][2] / 1000,
    },
  ];

  let previousTime = samples[0][0];
  let previousPressure = samples[0][2] / 1000;

  for (let i = 1; i < samples.length; i++) {
    const pressure = samples[i][2] / 1000;
    if (pressure >= previousPressure) {
      continue;
    }
    const time = samples[i][0];
    const interval = time - previousTime;
    const diff = previousPressure - pressure;
    const consumption = diff / interval;
    data.push({
      consumption,
      time,
      pressure,
    });
    previousTime = time;
    previousPressure = pressure;
  }

  return data;
}

function TankGraph({ dive: { samples } }: { dive: Dive }) {
  const { l10n } = useLocalization();
  const filteredSamples = samples.filter(
    ([_time, _depth, pressure]) => pressure,
  );

  if (!filteredSamples.length) {
    return null;
  }

  const data = computePressureAndConsumption(filteredSamples);

  return (
    <Line
      data={{
        datasets: [
          {
            data,
            parsing: {
              xAxisKey: "time",
              yAxisKey: "pressure",
            },
            yAxisID: "y",
          },
          {
            data,
            parsing: {
              xAxisKey: "time",
              yAxisKey: "consumption",
            },
            yAxisID: "y2",
            // @ts-expect-error the current types do not know about the "tooltip" override
            tooltip: {
              callbacks: {
                label: (ctx: TooltipItem<"line">) => {
                  const consumption = ctx.parsed.y;

                  return l10n.getString("graph-tooltip-air-consumption-label", {
                    consumption: new FluentNumber(consumption, {
                      maximumFractionDigits: 1,
                    }),
                  });
                },
              },
            },
          },
        ],
      }}
      options={{
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
          y2: {
            type: "linear",
            title: {
              display: true,
              text: l10n.getString("graph-axis-air-consumption-label"),
            },
            suggestedMin: 0,
            position: "right",
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
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

export function Dive({
  tripName,
  dive,
  initialShow,
}: {
  tripName?: string;
  dive: Dive;
  initialShow?: boolean;
}) {
  const [shown, toggleShow] = useState(initialShow);

  const dateTime = Date.parse(`${dive.date}T${dive.time}`);
  const endTime = dateTime + dive.duration * 1000;
  const diveInMinutes = {
    ...dive,
    samples: dive.samples.map(([time, ...rest]) => [time / 60, ...rest]),
  } as Dive;

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
        {tripName ? tripName + ": " : null}({dive.number}) {dive.location}
        <ShareDive className="share-dive" dive={dive} />
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
      {shown ? <DiveGraphs dive={diveInMinutes} /> : null}
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
          <Dive key={dive.number} tripName={trip.name} dive={dive} />
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
