#include <brotli/encode.h>
#include <stdlib.h>
#include <custom/utils.h>

uint32_t* compress_buffer(int quality, int lgwin, int mode, size_t input_size, const uint8_t* input_buffer){
  uint32_t* result = (uint32_t*)malloc(4/*buffer size*/ + 4/*buffer*/ + 4/*data length*/);
  size_t* buffer_size = (size_t*)&result[0];
  uint8_t** encoded_buffer = (uint8_t**)&result[1];
  size_t* data_length = (size_t*)&result[2];

  init_buffer_result(buffer_size, encoded_buffer, data_length);

  BrotliEncoderState *s = BrotliEncoderCreateInstance(0, 0, 0);
  if (!s) {
    free_buffer_result(result);
    return NULL;
  }

  BrotliEncoderSetParameter(s, BROTLI_PARAM_QUALITY, (uint32_t)quality);
  BrotliEncoderSetParameter(s, BROTLI_PARAM_LGWIN, (uint32_t)lgwin);
  BrotliEncoderSetParameter(s, BROTLI_PARAM_MODE, (uint32_t)mode);
  BrotliEncoderSetParameter(s, BROTLI_PARAM_SIZE_HINT, (uint32_t)input_size);
  if (lgwin > BROTLI_MAX_WINDOW_BITS) {
    BrotliEncoderSetParameter(s, BROTLI_PARAM_LARGE_WINDOW, BROTLI_TRUE);
  }

  size_t available_in = input_size;
  const uint8_t* next_in = input_buffer;
  size_t available_out = *buffer_size;
  uint8_t* next_out = *encoded_buffer;
  for(;;) {
    BROTLI_BOOL is_eof = available_in == 0;

    if(!BrotliEncoderCompressStream(
      s,
      is_eof ? BROTLI_OPERATION_FINISH : BROTLI_OPERATION_PROCESS,
      &available_in,
      &next_in,
      &available_out,
      &next_out,
      data_length
    )) {
        free_buffer_result(result);
        BrotliEncoderDestroyInstance(s);
        return NULL;
    }

    if (BrotliEncoderIsFinished(s)){
      BrotliEncoderDestroyInstance(s);
      return result;
    }

    if (available_out == 0) {
      double_buffer_result(buffer_size, encoded_buffer, &available_out, &next_out);
    }
  }
}
