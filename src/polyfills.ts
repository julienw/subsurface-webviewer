/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
