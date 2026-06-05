package com.iumeatelier;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.iumeatelier.mapper")
public class IumeAtelierApplication {

    public static void main(String[] args) {
        SpringApplication.run(IumeAtelierApplication.class, args);
    }
}
