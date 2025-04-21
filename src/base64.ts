/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export async function fromGzippedBase64(string: string): Promise<string> {
  const unencodedVal = Uint8Array.fromBase64(string, {
    alphabet: "base64url",
  });
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(unencodedVal);
  const closePromise = writer.close();
  const decodedStream = ds.readable.pipeThrough(new TextDecoderStream());
  let str = "";
  for await (const chunk of decodedStream) {
    str += chunk;
  }
  await closePromise;
  return str;
}

export async function toGzippedBase64(string: string): Promise<string> {
  const encodingStream = new TextEncoderStream();
  const compressionStream = new CompressionStream("deflate");
  const outputStream = encodingStream.readable.pipeThrough(compressionStream);
  const writer = encodingStream.writable.getWriter();
  writer.write(string);

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

  return base64;
}
