package com.ecommerce.service;

import com.ecommerce.exception.FileSizeLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    public String storeFile(MultipartFile file) {
        if (file.getSize() > MAX_SIZE)
            throw new FileSizeLimitException("File size exceeds 5MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, WebP and GIF allowed");

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String ext = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + ext;
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("File storage failed: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) return;
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve(fileUrl.replace("/uploads/", ""));
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
