ARG BROTLI_TAG=1.1.0

FROM debian:12.2 as source
RUN apt-get update -y && apt-get install -y git && apt-get clean
WORKDIR /src
RUN git clone --depth=1 --branch=v1.1.0 https://github.com/google/brotli.git
WORKDIR /src/brotli
RUN git submodule update --init --recursive

# RUN ls -l . && exit 1

FROM emscripten/emsdk:3.1.47
COPY --from=source /src/brotli /src
# RUN ls -l /src && exit 1

WORKDIR /src

COPY exported_encode.c c/enc/exported_encode.c

RUN mkdir dist
# RUN emcc -s WASM=1 -s EXPORTED_FUNCTIONS=_encode -s MODULARIZE \
#      -I./c/include \
#      c/common/*.c \
#     #  c/dec/*.c \
#      c/enc/*.c \
#      -o dist/brotli.js
# RUN emcc -s WASM=1 -s EXPORTED_FUNCTIONS=_encode \
#      c/enc/exported_encode.c \
#      -o dist/brotli.js
RUN emcc --no-entry -s ENVIRONMENT=web -s EXPORTED_FUNCTIONS="['_encode', '_malloc', '_free']" -s STANDALONE_WASM -Oz \
     -I./c/include \
     c/common/*.c \
     c/dec/*.c \
     c/enc/*.c \
     -o dist/brotli.wasm

# RUN apt-get update -y && apt-get install -y wabt
# RUN wasm-objdump -x dist/brotli.wasm | grep "import" && exit 1

# RUN ls -l /src/dist && exit 1
