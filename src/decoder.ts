import { WasmLoader } from "./types";

export interface BrotliDecoder {
  decompressBuffer: (buffer: Uint8Array) => Uint8Array;
}

type BrotliDecoderModuleExports = {
  decompress_buffer: (input_size: number, input_buffer: Pointer) => Pointer;
  free_buffer_result: (result: Pointer) => void;
  malloc: (size: number) => Pointer;
  free: (ptr: Pointer) => void;
  memory: WebAssembly.Memory;
};

type Pointer = number;

let encoder: BrotliDecoder | undefined;
export const ensureLoadedAsync = async (
  wasmLoader: WasmLoader
): Promise<BrotliDecoder> => {
  if (encoder) {
    return encoder;
  }

  const wasmBuffer = await wasmLoader();
  if (encoder) {
    return encoder;
  }

  const module = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      emscripten_notify_memory_growth: () => {},
    },
    wasi_snapshot_preview1: {
      proc_exit: (status: number) => {
        throw new Error(`Brotli failed with status ${status}.`);
      },
    },
  });
  if (encoder) {
    return encoder;
  }

  encoder = {
    decompressBuffer: (buffer) => {
      const { decompress_buffer, free_buffer_result, malloc, free, memory } =
        module.instance.exports as BrotliDecoderModuleExports;

      const dataPtr = malloc(buffer.length);
      try {
        new Uint8Array(memory.buffer).set(buffer, dataPtr);

        const resPtr = decompress_buffer(buffer.length, dataPtr);

        if (!resPtr) {
          throw new Error("Failed to decompress data.");
        }

        try {
          const redDataView = new DataView(memory.buffer);
          const resBufferPtr = redDataView.getUint32(resPtr + 4, true);
          const resDataLength = redDataView.getUint32(resPtr + 8, true);

          const outBuffer = new Uint8Array(resDataLength);
          outBuffer.set(
            new Uint8Array(memory.buffer).subarray(
              resBufferPtr,
              resBufferPtr + resDataLength
            )
          );

          return outBuffer;
        } finally {
          free_buffer_result(resPtr);
        }
      } finally {
        free(dataPtr);
      }
    },
  };

  return encoder;
};
