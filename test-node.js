const fs = require("fs");

const wasmBuffer = fs.readFileSync("./build-wasm/dist/brotli.wasm");
WebAssembly.instantiate(wasmBuffer, {
  wasi_snapshot_preview1: {
    proc_exit: (status) => {
      throw new Error(`Brotli failed with status ${status}.`);
    },
  },
}).then((wasmModule) => {
  for (let name in wasmModule.instance.exports) {
    console.log("name", name);
  }

  const { encode, malloc, free, memory } = wasmModule.instance.exports;
  console.log("encode", encode);

  const text = "this is simple text to be encoded.";
  const uint8Array = new TextEncoder().encode(text);
  const dataPtr = malloc(uint8Array.length);
  try {
    new Uint8Array(memory.buffer).set(uint8Array, dataPtr);

    const maxOutSize = 2_000;
    const outputPtr = malloc(maxOutSize);

    const encodedSize = encode(
      0,
      22,
      0,
      uint8Array.length,
      dataPtr,
      maxOutSize,
      outputPtr
    );
    console.log("encodedSize", encodedSize);

    const outBuffer = new Uint8Array(encodedSize);
    outBuffer.set(
      new Uint8Array(memory.buffer).subarray(outputPtr, outputPtr + encodedSize)
    );

    console.log("outBuffer", outBuffer.length, outBuffer);
    fs.writeFileSync("./output.br", outBuffer);
  } finally {
    free(dataPtr);
  }
});
