/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { useMemo, use } from "react";
import { Dive } from "./DiveList";
import { fromGzippedBase64 } from "./base64";

export function CompressedDive({ compressedDive }: { compressedDive: string }) {
  const uncompressedDivePromise = useMemo(async () => {
    const magicString = compressedDive.slice(0, 2);
    switch (magicString) {
      case "1-":
        {
          // Compression protocol number 1
          const decompressed = await fromGzippedBase64(compressedDive.slice(2));
          return JSON.parse(decompressed);
        }
        break;
      default:
        throw new Error(`Unknown magic compression string ${magicString}`);
    }
  }, [compressedDive]);

  const uncompressedDive = use(uncompressedDivePromise);
  return <Dive dive={uncompressedDive} initialShow={true} />;
}
