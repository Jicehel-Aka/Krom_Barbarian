idf_component_register(
    SRCS "src/aka_runtime.cpp" "src/core/input.cpp"
    INCLUDE_DIRS "include"
    REQUIRES gamebuino app_update esp_partition esp_timer)

target_compile_options(${COMPONENT_LIB} PRIVATE
    -Wno-error=format-truncation
    -Wno-error=stringop-truncation
    -Wno-error=maybe-uninitialized
)
