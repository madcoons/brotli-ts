#include <brotli/decode.h>
#include <stdlib.h>
#include <custom/utils.h>

uint32_t* decompress_buffer(size_t input_size, const uint8_t* input_buffer){
  uint32_t* result = (uint32_t*)malloc(4/*buffer size*/ + 4/*buffer*/ + 4/*data length*/);
  size_t* buffer_size = (size_t*)&result[0];
  uint8_t** out_buffer = (uint8_t**)&result[1];
  size_t* data_length = (size_t*)&result[2];

  init_buffer_result(buffer_size, out_buffer, data_length);

  BrotliDecoderState* s = BrotliDecoderCreateInstance(NULL, NULL, NULL);
  if (!s) {
    free_buffer_result(result);
    return NULL;
  }

  BrotliDecoderSetParameter(s, BROTLI_DECODER_PARAM_LARGE_WINDOW, 1u);

  size_t available_in = input_size;
  const uint8_t* next_in = input_buffer;
  size_t available_out = *buffer_size;
  uint8_t* next_out = *out_buffer;
  for (;;) {
    BrotliDecoderResult status = BrotliDecoderDecompressStream(s, &available_in, &next_in, &available_out, &next_out, data_length);

    if (status == BROTLI_DECODER_RESULT_SUCCESS) {
      BrotliDecoderDestroyInstance(s);
      return result;
    } else if (status == BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT) {
      double_buffer_result(buffer_size, out_buffer, &available_out, &next_out);
    } else {
      free_buffer_result(result);
      BrotliDecoderDestroyInstance(s);
      return NULL;
    }
  }
}
