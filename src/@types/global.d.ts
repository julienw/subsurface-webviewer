interface Uint8ArrayConstructor {
  fromBase64: (
    base64: string,
    options?: Partial<{
      alphabet: "base64" | "base64url";
      lastChunkHandling: "loose" | "strict" | "stop-before-partial";
    }>,
  ) => Uint8Array;
  fromHex: (hex: string) => Uint8Array;
}

interface Uint8Array {
  toBase64: (
    options?: Partial<{
      alphabet: "base64" | "base64url";
      omitPadding: boolean;
    }>,
  ) => string;
  toHex: () => string;
  setFromHex: (hex: string) => { read: number; written: number };
  setFromBase64: (
    base64: string,
    options?: Partial<{
      alphabet: "base64" | "base64url";
      lastChunkHandling: "loose" | "strict" | "stop-before-partial";
    }>,
  ) => { read: number; written: number };
}
