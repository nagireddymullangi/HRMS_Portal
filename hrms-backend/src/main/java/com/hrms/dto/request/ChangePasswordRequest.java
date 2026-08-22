
//dto/request/ChangePasswordRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {

 @NotBlank(message = "Current password is required")
 private String currentPassword;

 @NotBlank(message = "New password is required")
 @Size(min = 8, message = "Password must be at least 8 characters")
 @Pattern(
     regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])" +
              "[A-Za-z\\d@$!%*?&#]+$",
     message = "Password must contain uppercase, lowercase, " +
               "number and special character"
 )
 private String newPassword;

 @NotBlank(message = "Confirm password is required")
 private String confirmPassword;
}