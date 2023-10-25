#include <stdlib.h>
#include <stdint.h>

void init_buffer_result(size_t* buffer_size, uint8_t** encoded_buffer, size_t* data_length);
void double_buffer_result(size_t* buffer_size, uint8_t** encoded_buffer, size_t* available_out, uint8_t** next_out);
void free_buffer_result(uint32_t* result);
