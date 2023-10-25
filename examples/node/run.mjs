import { ensureLoadedAsync as ensureEncoderLoadedAsync } from "brotli-ts/encoder";
import { ensureLoadedAsync as ensureDecoderLoadedAsync } from "brotli-ts/decoder";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

Promise.all([
  ensureEncoderLoadedAsync(() =>
    fs.readFile(fileURLToPath(import.meta.resolve("brotli-ts/wasm/encoder")))
  ),
  ensureDecoderLoadedAsync(() =>
    fs.readFile(fileURLToPath(import.meta.resolve("brotli-ts/wasm/decoder")))
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
