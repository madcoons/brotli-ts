export type WasmLoader = () =>
  | Uint8Array
  | Response
  | Promise<Uint8Array | Response>;
