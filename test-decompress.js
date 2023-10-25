const fs = require("fs");

const wasmBuffer = fs.readFileSync("./build-wasm/dist/brotli-decompress.wasm");
WebAssembly.instantiate(wasmBuffer, {
  env: {
    emscripten_notify_memory_growth: () => {},
  },
  wasi_snapshot_preview1: {
    proc_exit: (status) => {
      throw new Error(`Brotli failed with status ${status}.`);
    },
  },
}).then((wasmModule) => {
  for (let name in wasmModule.instance.exports) {
    console.log("name", name);
  }

  const { decompress_buffer, free_buffer_result, malloc, free, memory } =
    wasmModule.instance.exports;

  // const text = "this is simple text to be encoded.";
  // const uint8Array = new TextEncoder().encode(text);
  const uint8Array = fs.readFileSync("/home/miki/Downloads/large-canvas.mdcanvas");
  console.log("uint8Array.length", uint8Array.length);
  const dataPtr = malloc(uint8Array.length);
  try {
    new Uint8Array(memory.buffer).set(uint8Array, dataPtr);

    const resPtr = decompress_buffer(uint8Array.length, dataPtr);
    if (!resPtr) {
      throw new Error("Failed to compress data.");
    }

    try {
      const redDataView = new DataView(memory.buffer);
      const resBufferSize = redDataView.getUint32(resPtr, true);
      const resBufferPtr = redDataView.getUint32(resPtr + 4, true);
      const resDataLength = redDataView.getUint32(resPtr + 8, true);

      console.log("resBufferSize", resBufferSize);
      console.log("resBufferPtr", resBufferPtr);
      console.log("resDataLength", resDataLength);

      const outBuffer = new Uint8Array(resDataLength);
      outBuffer.set(
        new Uint8Array(memory.buffer).subarray(
          resBufferPtr,
          resBufferPtr + resDataLength
        )
      );

      console.log("outBuffer", outBuffer.length, outBuffer);
      fs.writeFileSync("./output.json", outBuffer);
    } finally {
      free_buffer_result(resPtr);
    }
  } finally {
    free(dataPtr);
  }
});
