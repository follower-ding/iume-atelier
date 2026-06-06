package com.iumeatelier.dto.response;

import com.iumeatelier.dto.request.AiToolRequest;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiToolGenerateResponse {

    /** AI 生成的工具草稿，保存前可人工修改 */
    private AiToolRequest draft;

    /** AI 用自然语言做的简要说明 */
    private String summary;

    private String model;
}
