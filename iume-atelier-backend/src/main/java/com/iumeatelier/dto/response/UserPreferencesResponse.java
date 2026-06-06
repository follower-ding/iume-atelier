package com.iumeatelier.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User personalization preferences")
public class UserPreferencesResponse {

    private String companionCallName;

    @Builder.Default
    private List<String> customQuotes = new ArrayList<>();

    @Builder.Default
    private List<CustomMusicTrackResponse> customTracks = new ArrayList<>();
}
