import { WasmLoader } from "./types";

export interface EncoderOptions {
  quality?: number;
  lgwin?: number;
  mode?: number;
}

export interface BrotliEncoder {
  compressBuffer: (buffer: Uint8Array, options?: EncoderOptions) => Uint8Array;
}

type BrotliEncoderModuleExports = {
  compress_buffer: (
    quality: number,
    lgwin: number,
    mode: number,
    input_size: number,
    input_buffer: Pointer
  ) => Pointer;
  free_buffer_result: (result: Pointer) => void;
  malloc: (size: number) => Pointer;
  free: (ptr: Pointer) => void;
  memory: WebAssembly.Memory;
};

type Pointer = number;

let encoder: BrotliEncoder | undefined;
export const ensureLoadedAsync = async (
  wasmLoader: WasmLoader
): Promise<BrotliEncoder> => {
  if (encoder) {
    return encoder;
  }

  const wasm = await wasmLoader();

  if (encoder) {
    return encoder;
  }

  const importObject = {
    env: {
      emscripten_notify_memory_growth: () => {},
    },
    wasi_snapshot_preview1: {
      proc_exit: (status: number) => {
        throw new Error(`Brotli failed with status ${status}.`);
      },
    },
  };

  const module =
    wasm instanceof Uint8Array
      ? await WebAssembly.instantiate(wasm, importObject)
      : await WebAssembly.instantiateStreaming(wasm, importObject);

  if (encoder) {
    return encoder;
  }

  encoder = {
    compressBuffer: (buffer, options) => {
      const { quality = 7, lgwin = 0, mode = 0 } = options ?? {};
      const { compress_buffer, free_buffer_result, malloc, free, memory } =
        module.instance.exports as BrotliEncoderModuleExports;

      const dataPtr = malloc(buffer.length);
      try {
        new Uint8Array(memory.buffer).set(buffer, dataPtr);

        const resPtr = compress_buffer(
          quality,
          lgwin,
          mode,
          buffer.length,
          dataPtr
        );

        if (!resPtr) {
          throw new Error("Failed to compress data.");
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
