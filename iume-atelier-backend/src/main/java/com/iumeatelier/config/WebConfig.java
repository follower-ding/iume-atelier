package com.iumeatelier.config;

import com.iumeatelier.storage.LocalFileStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
@ConditionalOnBean(LocalFileStorage.class)
public class WebConfig implements WebMvcConfigurer {

    private final LocalFileStorage localFileStorage;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = localFileStorage.getUploadDir().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }
}
