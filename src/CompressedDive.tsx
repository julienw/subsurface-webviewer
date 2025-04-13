/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { useMemo, use } from "react";
import { Dive } from "./DiveList";

export function CompressedDive({ compressedDive }: { compressedDive: string }) {
  const uncompressedDivePromise = useMemo(async () => {
    const magicString = compressedDive.slice(0, 2);
    switch (magicString) {
      case "1-":
        {
          // Compression protocol number 1
          const unencodedVal = Uint8Array.fromBase64(compressedDive.slice(2), {
            alphabet: "base64url",
          });
          const ds = new DecompressionStream("deflate");
          const writer = ds.writable.getWriter();
          writer.write(unencodedVal);
          const closePromise = writer.close();
          const decodedStream = ds.readable.pipeThrough(
            new TextDecoderStream(),
          );
          let str = "";
          for await (const chunk of decodedStream) {
            str += chunk;
          }
          await closePromise;
          return JSON.parse(str);
        }
        break;
      default:
        throw new Error(`Unknown magic compression string ${magicString}`);
    }
  }, [compressedDive]);

  const uncompressedDive = use(uncompressedDivePromise);
  return <Dive tripName="test" dive={uncompressedDive} initialShow={true} />;
}
