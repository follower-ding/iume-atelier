package com.iumeatelier.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AiToolDetailRequest {

    private String intro;

    @NotEmpty
    private List<String> features = new ArrayList<>();

    private List<String> install = new ArrayList<>();

    private List<String> setup = new ArrayList<>();

    @NotEmpty
    private List<String> usage = new ArrayList<>();

    private List<AiToolConfigRequest> configs = new ArrayList<>();

    private List<String> related = new ArrayList<>();
}
