import { ensureLoadedAsync as ensureEncoderLoadedAsync } from "../../src/encoder";
import { ensureLoadedAsync as ensureDecoderLoadedAsync } from "../../src/decoder";
import fs from "node:fs/promises";

Promise.all([
  ensureEncoderLoadedAsync(() =>
    fs.readFile("build-wasm/dist/brotli-encoder.wasm")
  ),
  ensureDecoderLoadedAsync(() =>
    fs.readFile("build-wasm/dist/brotli-decoder.wasm")
  ),
]).then(([endocer, decoder]) => {
  const compressedData = endocer.compressBuffer(
    Buffer.from("this is text to be encoded.", "utf-8")
  );
  console.log("compressedData:", compressedData);

  const uncompressedData = decoder.decompressBuffer(compressedData);
  console.log(
    "uncompressedData:",
    Buffer.from(uncompressedData).toString("utf-8")
  );
});
