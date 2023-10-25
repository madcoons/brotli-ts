#include <custom/utils.h>

void init_buffer_result(size_t* buffer_size, uint8_t** encoded_buffer, size_t* data_length) {
  *buffer_size = 1024 * 1024; // Initial buffer size of 1MiB
  *encoded_buffer = (uint8_t*) malloc(*buffer_size);
  *data_length = 0;
}

void double_buffer_result(size_t* buffer_size, uint8_t** encoded_buffer, size_t* available_out, uint8_t** next_out) {
  size_t offset = *next_out - *encoded_buffer;
  *available_out += *buffer_size;
  *buffer_size *= 2;
  *encoded_buffer = (uint8_t*) realloc(*encoded_buffer, *buffer_size);
  *next_out = *encoded_buffer + offset;
}

void free_buffer_result(uint32_t* result) {
  free((uint8_t*)result[1]);
  free(result);
}