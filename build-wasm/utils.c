#include <custom/utils.h>

void init_buffer_result(size_t* buffer_size, uint8_t** buffer, size_t* data_length) {
  *buffer_size = 1024 * 1024; // Initial buffer size of 1MiB
  *buffer = (uint8_t*) malloc(*buffer_size);
  *data_length = 0;
}

void double_buffer_result(size_t* buffer_size, uint8_t** buffer, size_t* available_out, uint8_t** next_out) {
  size_t offset = *next_out - *buffer;
  *available_out += *buffer_size;
  *buffer_size *= 2;
  *buffer = (uint8_t*) realloc(*buffer, *buffer_size);
  *next_out = *buffer + offset;
}

void free_buffer_result(uint32_t* result) {
  free((uint8_t*)result[1]);
  free(result);
}