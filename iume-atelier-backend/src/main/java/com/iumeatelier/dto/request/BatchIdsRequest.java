package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Batch operation by IDs")
public class BatchIdsRequest {

    @NotEmpty(message = "IDs are required")
    private List<Long> ids;
}
