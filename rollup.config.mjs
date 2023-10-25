import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import { defineConfig } from "rollup";
import copy from "rollup-plugin-copy";

export default [
  ...["encoder", "decoder"]
    .map((type) => [
      defineConfig({
        input: `src/${type}.ts`,
        output: { file: `dist/types/${type}.d.ts`, format: "esm" },
        plugins: [
          dts(),
          copy({
            targets: [
              {
                src: `build-wasm/dist/brotli-${type}.wasm`,
                dest: "dist/wasm",
                rename: `${type}.wasm`,
              },
            ],
          }),
        ],
      }),
      defineConfig({
        input: `src/${type}.ts`,
        output: {
          file: `dist/cjs/${type}.js`,
          format: "cjs",
        },
        plugins: [
          typescript({
            tsconfig: "tsconfig.lib.json",
          }),
        ],
        external: [],
      }),
      defineConfig({
        input: `src/${type}.ts`,
        output: {
          file: `dist/esm/${type}.mjs`,
          format: "esm",
        },
        plugins: [
          typescript({
            tsconfig: "tsconfig.lib.json",
          }),
        ],
        external: [],
      }),
    ])
    .flat(1),
];
