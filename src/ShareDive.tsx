/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { useState } from "react";
import type { Dive } from "./types";

type Props = {
  dive: Dive;
  className?: string;
};

export function ShareDive({ dive, className }: Props) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    const stringifiedDive = JSON.stringify(dive);
    const encodingStream = new TextEncoderStream();
    const compressionStream = new CompressionStream("deflate");
    const outputStream = encodingStream.readable.pipeThrough(compressionStream);
    const writer = encodingStream.writable.getWriter();
    writer.write(stringifiedDive);

    const [acc] = await Promise.all([
      Array.fromAsync(outputStream),
      writer.close(),
    ]);

    const length = acc.reduce((l, item) => l + item.length, 0);
    const resultArray = new Uint8Array(length);

    let offset = 0;
    for (const arr of acc) {
      resultArray.set(arr, offset);
      offset += arr.length;
    }

    const base64 = resultArray.toBase64({
      alphabet: "base64url",
      omitPadding: true,
    });
    const url = new URL(window.location.href);
    url.hash = "/single-dive/1-" + base64;
    const strUrl = url.toString();

    if (navigator.share) {
      await navigator.share({ url: strUrl });
    } else {
      await navigator.clipboard.writeText(strUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <button
        className={className}
        data-l10n-id="share-dive"
        type="button"
        onClickCapture={onClick}
      >
        Share this dive
      </button>
      {copied ? <span data-l0n-id="url-copied">Copié</span> : null}
    </>
  );
}
