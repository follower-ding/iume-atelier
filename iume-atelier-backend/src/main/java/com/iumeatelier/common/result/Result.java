package com.iumeatelier.common.result;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {

  private int code;
  private String message;
  private T data;
  private long timestamp;

  public static <T> Result<T> ok(T data) {
    return new Result<>(0, "success", data, Instant.now().toEpochMilli());
  }

  public static <T> Result<T> ok(String message, T data) {
    return new Result<>(0, message, data, Instant.now().toEpochMilli());
  }

  public static <T> Result<T> fail(int code, String message) {
    return new Result<>(code, message, null, Instant.now().toEpochMilli());
  }
}
