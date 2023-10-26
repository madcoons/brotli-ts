import { ensureLoadedAsync as ensureDecoderLoadedAsync } from "brotli-ts/decoder";
import { ensureLoadedAsync as ensureEncoderLoadedAsync } from "brotli-ts/encoder";
import wasmDecoderUrl from "brotli-ts/wasm/decoder?url";
import wasmEncoderUrl from "brotli-ts/wasm/encoder?url";

export const compress = (buf: Uint8Array): Promise<Uint8Array> =>
  ensureEncoderLoadedAsync(() => fetch(wasmEncoderUrl)).then((encoder) =>
    encoder.compressBuffer(buf)
  );

export const decompress = (buf: Uint8Array): Promise<Uint8Array> =>
  ensureDecoderLoadedAsync(() => fetch(wasmDecoderUrl)).then((decoder) =>
    decoder.decompressBuffer(buf)
  );
