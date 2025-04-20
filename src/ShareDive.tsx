/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { useState } from "react";
import cx from "classnames";
import { Localized } from "@fluent/react";

import { toGzippedBase64 } from "./base64";
import type { Dive } from "./types";

import "./ShareDive.css";

type Props = {
  dive: Dive;
  className?: string;
};

export function ShareDive({ dive, className }: Props) {
  const [copied, setCopied] = useState(false);
  async function onClick(e: React.SyntheticEvent) {
    e.stopPropagation();

    // Set copied to false so that the appearing animation is always showing.
    setCopied(false);

    const stringifiedDive = JSON.stringify(dive);
    const base64 = await toGzippedBase64(stringifiedDive);
    const url = new URL(window.location.href);
    url.hash = "/single-dive/1-" + base64; // 1- is protocol v1, the only one implemented for now.
    const strUrl = url.toString();

    if (navigator.share) {
      await navigator.share({ url: strUrl });
    } else {
      await navigator.clipboard.writeText(strUrl);
      setCopied(true);
    }
  }

  return (
    <div className={cx(className, "share-dive-container")}>
      <Localized id="share-dive">
        <button className="share-dive-button" type="button" onClick={onClick}>
          Share this dive
        </button>
      </Localized>
      {/* @ts-expect-error typescript things navigator.share is always prresent. */}
      {navigator.share ? null : (
        <Localized id="url-copied">
          <div
            className={cx("copied-message", {
              "copied-message-displayed": copied,
            })}
          >
            Copied
          </div>
        </Localized>
      )}
    </div>
  );
}
