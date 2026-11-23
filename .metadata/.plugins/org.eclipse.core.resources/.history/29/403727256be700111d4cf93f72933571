
//config/AdminDataInitializer.java
package com.hrms.config;

import com.hrms.model.User;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminDataInitializer {

 private final UserRepository userRepository;
 private final PasswordEncoder passwordEncoder;

 @Value("${app.seed-admin:false}")
 private boolean seedAdmin;

 @Bean
 CommandLineRunner initializeAdminUser() {
     return args -> {
         // Only executes when app.seed-admin=true
         if (!seedAdmin) {
             return;
         }

         String username = "admin";
         String email = "ngireddymullangi@gmail.com";
         String rawPassword = "Admin@123";

         User admin = userRepository.findByUsername(username)
                 .orElseGet(() -> User.builder()
                         .username(username)
                         .build());

         admin.setEmail(email);
         admin.setPassword(passwordEncoder.encode(rawPassword));
         admin.setRole(User.Role.ROLE_ADMIN);
         admin.setIsActive(true);

         userRepository.save(admin);

         System.out.println("==============================================");
         System.out.println("DEV ADMIN USER READY");
         System.out.println("Username: admin");
         System.out.println("Password: Admin@123");
         System.out.println("==============================================");
     };
 }
}