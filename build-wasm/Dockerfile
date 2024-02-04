FROM debian:12.4 as source
RUN apt-get update -y && apt-get install -y git && apt-get clean
WORKDIR /src
RUN git clone --depth=1 --branch=v1.1.0 https://github.com/google/brotli.git
WORKDIR /src/brotli
RUN git submodule update --init --recursive

# RUN ls -l . && exit 1

FROM emscripten/emsdk:3.1.53
COPY --from=source /src/brotli /src
# RUN ls -l /src && exit 1

WORKDIR /src

COPY utils.h c/include/custom/utils.h
COPY utils.c c/common/utils.c
COPY encoder.c c/custom/enc/encoder.c
COPY decoder.c c/custom/dec/decoder.c

RUN mkdir dist

# compress
RUN emcc --no-entry -s ENVIRONMENT=web -s EXPORTED_FUNCTIONS="['_compress_buffer', '_free_buffer_result', '_malloc', '_free']" -s STANDALONE_WASM -s ALLOW_MEMORY_GROWTH -Oz \
     -I./c/include \
     -I./c/common \
     c/common/*.c \
     c/enc/*.c \
     c/custom/enc/encoder.c \
     -o dist/brotli-encoder.wasm

# decompress
RUN emcc --no-entry -s ENVIRONMENT=web -s EXPORTED_FUNCTIONS="['_decompress_buffer', '_free_buffer_result', '_malloc', '_free']" -s STANDALONE_WASM -s ALLOW_MEMORY_GROWTH -Oz \
     -I./c/include \
     -I./c/common \
     c/common/*.c \
     c/dec/*.c \
     c/custom/dec/decoder.c \
     -o dist/brotli-decoder.wasm

# RUN ls -l /src/dist && exit 1
