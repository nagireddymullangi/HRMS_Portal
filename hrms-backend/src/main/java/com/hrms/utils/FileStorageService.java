
//utils/FileStorageService.java
package com.hrms.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

 @Value("${app.upload.dir:./uploads}")
 private String uploadDir;

 public String saveBase64Image(String base64Data, String category) {
     try {
         // Remove data URL prefix if present
         if (base64Data.contains(",")) {
             base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
         }

         // Decode base64
         byte[] imageBytes = Base64.getDecoder().decode(base64Data);

         // Create directory structure
         String subDir = category + "/" +
             LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
         Path dirPath = Paths.get(uploadDir, subDir);
         Files.createDirectories(dirPath);

         // Generate unique filename
         String filename = UUID.randomUUID() + ".jpg";
         Path filePath = dirPath.resolve(filename);

         // Save file
         try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
             fos.write(imageBytes);
         }

         String relativePath = "/uploads/" + subDir + "/" + filename;
         log.info("Image saved: {}", relativePath);
         return relativePath;

     } catch (Exception e) {
         log.error("Failed to save image", e);
         throw new RuntimeException("Failed to save image: " + e.getMessage());
     }
 }

 public boolean deleteFile(String filePath) {
     try {
         if (filePath == null || filePath.isEmpty()) return false;

         // Remove leading slash and prepend upload dir
         String cleanPath = filePath.startsWith("/")
             ? filePath.substring(1) : filePath;
         File file = new File(cleanPath);

         if (file.exists()) {
             return file.delete();
         }
     } catch (Exception e) {
         log.error("Failed to delete file: {}", filePath, e);
     }
     return false;
 }
}