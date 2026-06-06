package com.iumeatelier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "User personalization preferences")
public class UserPreferencesRequest {

    @Size(max = 30, message = "Companion call name must not exceed 30 characters")
    @Schema(description = "How the companion addresses the user", example = "小明")
    private String companionCallName = "";

    @Size(max = 8, message = "At most 8 custom quotes")
    @Schema(description = "Custom encouragement quotes")
    private List<@Size(max = 200) String> customQuotes = new ArrayList<>();

    @Size(max = 30, message = "At most 30 custom tracks")
    @Valid
    @Schema(description = "User-uploaded music tracks")
    private List<CustomMusicTrackRequest> customTracks = new ArrayList<>();
}
