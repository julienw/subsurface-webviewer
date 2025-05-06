/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Chrome
if (!new Uint8Array().toBase64) {
  Uint8Array.prototype.toBase64 = function (
    options: Partial<{
      alphabet: "base64" | "base64url";
      omitPadding: boolean;
    }> = {},
  ): string {
    let str = "";
    for (const code of this) {
      str += String.fromCharCode(code);
    }
    let encodedStr = btoa(str);
    if (options.alphabet === "base64url") {
      encodedStr = encodedStr.replaceAll("+", "-").replaceAll("/", "_");
    }

    if (options.omitPadding) {
      encodedStr = encodedStr.replaceAll("=", "");
    }

    return encodedStr;
  };
}

// Chrome
if (!Uint8Array.fromBase64) {
  Uint8Array.fromBase64 = function (
    base64: string,
    options: Partial<{
      alphabet: "base64" | "base64url";
      lastChunkHandling: "loose" | "strict" | "stop-before-partial";
    }> = {},
  ): Uint8Array {
    if (options.alphabet === "base64url") {
      base64 = base64.replaceAll("-", "+").replaceAll("_", "/");
    }
    const decoded = atob(base64);
    const result = new Uint8Array(decoded.length);
    for (let i = 0; i < result.length; i++) {
      result[i] = decoded.charCodeAt(i);
    }

    return result;
  };
}

// Safari
if (!ReadableStream.prototype.values) {
  ReadableStream.prototype.values = async function* <T>(
    this: ReadableStream<T>,
    options: Partial<{ preventCancel: boolean }> = {},
  ): ReadableStreamAsyncIterator<T> {
    let done = false;
    let value = null;
    const reader = this.getReader();
    try {
      while (!done) {
        ({ done, value } = await reader.read());
        if (value !== undefined) yield value;
      }
    } finally {
      if (!options.preventCancel) {
        await reader.cancel();
      }
      reader.releaseLock();
    }
  };
}

// Safari
if (!ReadableStream.prototype[Symbol.asyncIterator]) {
  ReadableStream.prototype[Symbol.asyncIterator] =
    ReadableStream.prototype.values;
}
