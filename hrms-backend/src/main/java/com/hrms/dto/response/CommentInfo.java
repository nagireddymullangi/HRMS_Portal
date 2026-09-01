package com.hrms.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Data
public class CommentInfo {
 private Long id;
 private Long userId;
 private String userName;
 private String comment;
 private Boolean isInternal;
 private LocalDateTime createdAt;
}