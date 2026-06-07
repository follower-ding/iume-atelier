package com.iumeatelier.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {

    StoredFile store(MultipartFile file, String storedName, String contentType);

    record StoredFile(String publicUrl, String storedName) {}
}
