package com.iumeatelier.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated result wrapper")
public class PageResult<T> {

    @Schema(description = "Current page number", example = "1")
    private long page;

    @Schema(description = "Page size", example = "10")
    private long size;

    @Schema(description = "Total record count", example = "100")
    private long total;

    @Schema(description = "Page records")
    private List<T> records;

    public static <T> PageResult<T> of(long page, long size, long total, List<T> records) {
        return new PageResult<>(page, size, total, records);
    }
}
