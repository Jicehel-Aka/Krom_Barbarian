idf_component_register(
    SRCS "main.cpp"
    INCLUDE_DIRS "."
    REQUIRES gamebuino aka_runtime aka_font esp_timer heap
)

target_compile_options(${COMPONENT_LIB} PRIVATE
    -Wno-error=format-truncation
    -Wno-error=stringop-truncation
    -Wno-error=maybe-uninitialized
    -Wno-error=missing-field-initializers
)
