#include <brotli/encode.h>
#include <stdlib.h>

void init_buffer_result(size_t* buffer_size, uint8_t** buffer, size_t* data_length);
void double_buffer_result(size_t* buffer_size, uint8_t** buffer, size_t* available_out, uint8_t** next_out);
void free_buffer_result(uint32_t* result);

void set_lgwin(BrotliEncoderState *s, int lgwin, size_t input_size);
